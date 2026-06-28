//! `GET /download-all.zip` — bundle every file visible to the requesting device
//! into a single zip and stream it back as one download. Token-gated like the
//! per-file route; the temp archive is deleted once the response has finished
//! streaming (or the client disconnects).

use std::path::PathBuf;
use std::pin::Pin;
use std::task::{Context, Poll};

use axum::body::Body;
use axum::extract::{Query, State};
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use futures_util::Stream;
use serde::Deserialize;
use tokio_util::io::ReaderStream;
use uuid::Uuid;

use super::router::QuickCtx;
use super::types::TrayItem;
use super::zip_bundle::build_zip;

#[derive(Debug, Deserialize)]
pub struct ZipQuery {
    #[serde(default)]
    pub token: String,
    /// Stable id of the requesting device, used to scope which files are bundled.
    #[serde(default)]
    pub device: String,
}

pub async fn download_all_zip(
    Query(query): Query<ZipQuery>,
    State(ctx): State<QuickCtx>,
) -> Response {
    if !ctx.manager.validate_token(&query.token) {
        return (StatusCode::UNAUTHORIZED, "invalid or missing token").into_response();
    }
    let device = query.device.trim().to_string();
    let files: Vec<TrayItem> = ctx
        .manager
        .snapshot_items_for(&device)
        .into_iter()
        .filter(|i| i.kind == "file" && i.local_path.is_some())
        .collect();
    if files.is_empty() {
        return (StatusCode::NOT_FOUND, "no files to download").into_response();
    }

    // Build the archive in the OS temp dir; a Drop guard removes it once the
    // streamed body is finished (or dropped on client disconnect).
    let temp_path = std::env::temp_dir().join(format!("quickshare-{}.zip", Uuid::new_v4()));
    let build_path = temp_path.clone();
    let summary = match tokio::task::spawn_blocking(move || build_zip(&files, &build_path, false))
        .await
    {
        Ok(Ok(s)) if s.files > 0 => s,
        _ => {
            let _ = std::fs::remove_file(&temp_path);
            return (StatusCode::INTERNAL_SERVER_ERROR, "failed to build archive").into_response();
        }
    };

    let file = match tokio::fs::File::open(&temp_path).await {
        Ok(f) => f,
        Err(_) => {
            let _ = std::fs::remove_file(&temp_path);
            return (StatusCode::INTERNAL_SERVER_ERROR, "archive unavailable").into_response();
        }
    };

    let stream = GuardedStream {
        inner: ReaderStream::new(file),
        _guard: TempFileGuard(temp_path),
    };

    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "application/zip")
        .header(header::CONTENT_LENGTH, summary.size)
        .header(
            header::CONTENT_DISPOSITION,
            "attachment; filename=\"QuickShare.zip\"",
        )
        .body(Body::from_stream(stream))
        .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response())
}

/// Deletes the backing temp file when dropped (after the body streams or the
/// client disconnects).
struct TempFileGuard(PathBuf);

impl Drop for TempFileGuard {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(&self.0);
    }
}

/// Wraps the file stream so the temp-file guard lives exactly as long as the
/// response body. Both fields are `Unpin`, so the struct is too.
struct GuardedStream {
    inner: ReaderStream<tokio::fs::File>,
    _guard: TempFileGuard,
}

impl Stream for GuardedStream {
    type Item = <ReaderStream<tokio::fs::File> as Stream>::Item;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        let this = self.get_mut();
        Pin::new(&mut this.inner).poll_next(cx)
    }
}
