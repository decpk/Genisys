//! axum router for the Content Share server. Two endpoints back the
//! approval-gated, two-step transfer:
//!   * `POST /share/offer` — announce an incoming book/notes bundle; blocks
//!     until the desktop user accepts or declines (or it times out), then
//!     returns a one-time upload token.
//!   * `POST /share/upload?token=…` — stream the bundle zip; imported into the
//!     database as a fresh copy. `GET /ping` is a lightweight liveness probe.

use std::sync::Arc;
use std::time::Duration;

use axum::body::Body;
use axum::extract::{DefaultBodyLimit, Query, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::Deserialize;
use serde_json::json;
use tauri::{AppHandle, Emitter};
use uuid::Uuid;

use crate::database::Database;

use super::auth::generate_token;
use super::import::import_bundle;
use super::state::{ArmedUpload, ContentShareManager};
use super::types::{
    IncomingTransferEvent, ReceivedEvent, ShareOffer, ShareOfferResponse,
};

/// Largest bundle we will accept over the wire (1 GiB) — a generous LAN cap.
const MAX_BUNDLE: usize = 1024 * 1024 * 1024;

/// How long the offer handler waits for the user's accept/decline decision.
const APPROVAL_TIMEOUT: Duration = Duration::from_secs(60);

/// Shared context handed to every route handler.
#[derive(Clone)]
pub struct ShareCtx {
    pub app: AppHandle,
    pub manager: ContentShareManager,
    pub db: Arc<Database>,
}

pub fn build_router(ctx: ShareCtx) -> Router {
    Router::new()
        .route("/ping", get(ping))
        .route("/share/offer", post(share_offer))
        .route(
            "/share/upload",
            post(share_upload).layer(DefaultBodyLimit::disable()),
        )
        .with_state(ctx)
}

async fn ping(State(ctx): State<ShareCtx>) -> impl IntoResponse {
    Json(json!({
        "ok": true,
        "deviceId": ctx.manager.device_id(),
        "deviceName": ctx.manager.device_name(),
    }))
}

async fn share_offer(
    State(ctx): State<ShareCtx>,
    Json(offer): Json<ShareOffer>,
) -> impl IntoResponse {
    let transfer_id = Uuid::new_v4().simple().to_string();
    let rx = ctx.manager.register_pending(&transfer_id);

    let _ = ctx.app.emit(
        "content-share-incoming",
        IncomingTransferEvent {
            transfer_id: transfer_id.clone(),
            sender_device_id: offer.sender_device_id.clone(),
            sender_device_name: offer.sender_device_name.clone(),
            manifest: offer.manifest.clone(),
        },
    );

    let accepted = matches!(
        tokio::time::timeout(APPROVAL_TIMEOUT, rx).await,
        Ok(Ok(true))
    );

    if !accepted {
        ctx.manager.remove_pending(&transfer_id);
        return Json(ShareOfferResponse {
            accepted: false,
            upload_token: None,
            transfer_id,
        });
    }

    let token = generate_token();
    ctx.manager.arm_upload(
        &transfer_id,
        ArmedUpload {
            token: token.clone(),
            sender_device_name: offer.sender_device_name,
        },
    );

    Json(ShareOfferResponse {
        accepted: true,
        upload_token: Some(token),
        transfer_id,
    })
}

#[derive(Deserialize)]
struct UploadQuery {
    token: String,
}

async fn share_upload(
    State(ctx): State<ShareCtx>,
    Query(q): Query<UploadQuery>,
    body: Body,
) -> impl IntoResponse {
    // Validate the one-time token before reading the (potentially large) body.
    let armed = match ctx.manager.take_armed(&q.token) {
        Some(a) => a,
        None => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(json!({ "success": false, "error": "invalid or expired token" })),
            )
                .into_response()
        }
    };

    let bytes = match axum::body::to_bytes(body, MAX_BUNDLE).await {
        Ok(b) => b,
        Err(_) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({ "success": false, "error": "failed to read bundle body" })),
            )
                .into_response()
        }
    };

    let db = ctx.db.clone();
    let payload = bytes.to_vec();
    let result = tokio::task::spawn_blocking(move || import_bundle(&db, payload)).await;

    match result {
        Ok(Ok(summary)) => {
            let _ = ctx.app.emit(
                "content-share-received",
                ReceivedEvent {
                    kind: summary.kind.clone(),
                    title: summary.title.clone(),
                    sender_device_name: armed.sender_device_name,
                },
            );
            (StatusCode::OK, Json(json!({ "success": true, "data": summary }))).into_response()
        }
        Ok(Err(e)) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "success": false, "error": e })),
        )
            .into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "success": false, "error": format!("import task failed: {e}") })),
        )
            .into_response(),
    }
}
