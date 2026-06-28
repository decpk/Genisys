//! WebSocket endpoint that relays WebRTC signaling between a remote browser
//! viewer and the desktop webview (which owns the camera + mic capture).
//!
//! Per-connection lifecycle: validate the token (before upgrade) -> approve the
//! device (auto-approve when it presents a still-valid trust grant, otherwise
//! emit ONE device-level approval request and block until the desktop
//! allows/denies, fail-safe: deny on timeout) -> hand the browser a fresh /
//! refreshed grant so its next reload skips the prompt -> tell the desktop a
//! viewer is ready (so it creates a peer connection + offer) -> then a single
//! loop relays signaling both ways: desktop->browser (offer / ICE) over a
//! per-client channel, and browser->desktop (answer / ICE) as Tauri events.
//!
//! The server never touches the media — audio/video flows peer-to-peer between
//! the desktop webview and the browser over WebRTC. The server only brokers SDP
//! and ICE candidates as opaque JSON.

use std::net::SocketAddr;
use std::time::Duration;

use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::{ConnectInfo, Query, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use futures_util::sink::SinkExt;
use futures_util::stream::{SplitSink, StreamExt};
use serde::Deserialize;
use tauri::Emitter;
use tokio::sync::{mpsc, watch};
use uuid::Uuid;

use super::router::MonitorCtx;
use super::types::{
    ApprovalRequestEvent, ClientConnectedEvent, ClientDisconnectedEvent, ClientInfo, ClientMessage,
    ClientsChangedEvent, ServerMessage, SignalEvent,
};

/// How long to wait for the desktop user to allow/deny before auto-denying.
const APPROVAL_TIMEOUT: Duration = Duration::from_secs(60);

#[derive(Debug, Deserialize)]
pub struct WsQuery {
    #[serde(default)]
    pub token: String,
    /// Optional trust grant from a prior approval. When present and still valid
    /// the connection is auto-approved (no desktop prompt) — this is what lets a
    /// page reload skip re-approval within the grant's lifetime.
    #[serde(default)]
    pub grant: String,
}

type Tx = SplitSink<WebSocket, Message>;

/// axum handler for `GET /ws`. Rejects bad tokens before upgrading.
pub async fn ws_handler(
    ws: WebSocketUpgrade,
    Query(query): Query<WsQuery>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(ctx): State<MonitorCtx>,
) -> Response {
    if !ctx.manager.validate_token(&query.token) {
        return (StatusCode::UNAUTHORIZED, "invalid or missing token").into_response();
    }
    let grant = query.grant;
    ws.on_upgrade(move |socket| handle_socket(socket, addr, ctx, grant))
}

async fn handle_socket(socket: WebSocket, addr: SocketAddr, ctx: MonitorCtx, grant: String) {
    let ip = addr.ip().to_string();
    let (mut ws_tx, mut ws_rx) = socket.split();

    // 1. ONE device-level approval gates the live feed. A device that presents a
    // still-valid trust grant (from a prior approval) is auto-approved with no
    // desktop prompt — this is what lets a page reload skip re-approval.
    // Otherwise we emit the approval request and block until the desktop
    // allows/denies (fail-safe: deny on timeout). Either way an approved
    // connection is handed a fresh / refreshed grant to store (sliding TTL).
    let grant_to_send: (String, i64);
    if let Some(expires_at) = ctx.manager.refresh_grant(&grant) {
        grant_to_send = (grant, expires_at);
    } else {
        let request_id = Uuid::new_v4().to_string();
        let approval = ctx.manager.register_pending(&request_id);
        let _ = ctx.app.emit(
            "monitor-approval-request",
            ApprovalRequestEvent {
                request_id: request_id.clone(),
                ip: ip.clone(),
            },
        );
        let _ = send_msg(&mut ws_tx, &ServerMessage::Pending).await;

        let approved = matches!(
            tokio::time::timeout(APPROVAL_TIMEOUT, approval).await,
            Ok(Ok(true))
        );
        ctx.manager.remove_pending(&request_id);
        if !approved {
            let _ = send_msg(
                &mut ws_tx,
                &ServerMessage::Denied {
                    reason: "The desktop did not approve this device".into(),
                },
            )
            .await;
            let _ = ws_tx.close().await;
            return;
        }
        grant_to_send = ctx.manager.issue_grant();
    }

    // 2. Register the connection-level client with its close + signaling channels.
    let client_id = Uuid::new_v4().to_string();
    let (close_tx, mut close_rx) = watch::channel(false);
    let (signal_tx, mut signal_rx) = mpsc::unbounded_channel();
    ctx.manager.register_client(
        ClientInfo {
            client_id: client_id.clone(),
            ip: ip.clone(),
            connected_at: chrono::Utc::now().timestamp_millis(),
        },
        close_tx,
        signal_tx,
    );
    emit_clients_changed(&ctx);

    // Hand the (fresh or refreshed) trust grant to the browser so it can store it
    // and skip the approval prompt on its next reload.
    let (grant_value, grant_expires_at) = grant_to_send;
    let _ = send_msg(
        &mut ws_tx,
        &ServerMessage::Granted {
            grant: grant_value,
            expires_at: grant_expires_at,
        },
    )
    .await;

    // 3. Tell the desktop a viewer is ready so it creates a peer connection,
    // adds its camera + mic tracks, and sends an offer back to this client.
    let _ = ctx.app.emit(
        "monitor-client-connected",
        ClientConnectedEvent {
            client_id: client_id.clone(),
            ip: ip.clone(),
        },
    );

    // 4. Relay signaling both ways until either side goes away.
    loop {
        tokio::select! {
            _ = close_rx.changed() => break,

            outgoing = signal_rx.recv() => match outgoing {
                Some(data) => {
                    if send_msg(&mut ws_tx, &ServerMessage::Signal { data }).await.is_err() {
                        break;
                    }
                }
                None => break,
            },

            incoming = ws_rx.next() => match incoming {
                Some(Ok(Message::Text(text))) => {
                    match serde_json::from_str::<ClientMessage>(&text) {
                        Ok(ClientMessage::Signal { data }) => {
                            let _ = ctx.app.emit(
                                "monitor-signal",
                                SignalEvent {
                                    client_id: client_id.clone(),
                                    data,
                                },
                            );
                        }
                        Err(_) => {}
                    }
                }
                Some(Ok(Message::Close(_))) | None => break,
                Some(Ok(_)) => {}
                Some(Err(_)) => break,
            },
        }
    }

    // 5. Clean up. The desktop tears down this client's peer connection.
    ctx.manager.unregister_client(&client_id);
    let _ = ctx.app.emit(
        "monitor-client-disconnected",
        ClientDisconnectedEvent {
            client_id: client_id.clone(),
        },
    );
    emit_clients_changed(&ctx);
}

fn emit_clients_changed(ctx: &MonitorCtx) {
    let _ = ctx.app.emit(
        "monitor-clients-changed",
        ClientsChangedEvent {
            clients: ctx.manager.snapshot_clients(),
        },
    );
}

async fn send_msg(ws_tx: &mut Tx, msg: &ServerMessage) -> Result<(), axum::Error> {
    let text = serde_json::to_string(msg)
        .unwrap_or_else(|_| String::from(r#"{"type":"error","message":"serialize failed"}"#));
    ws_tx.send(Message::Text(text)).await
}
