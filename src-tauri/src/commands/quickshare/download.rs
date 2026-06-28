//! `GET /file/:id` — stream a shared file from the desktop disk to a requesting
//! device. Token-gated; serves only files registered in the tray (looked up by
//! id), never an arbitrary client-supplied path.
//!
//! Supports HTTP `Range` requests (`Accept-Ranges: bytes`) so the receiver can
//! pull a big file over several parallel connections (each grabbing a slice),
//! which is dramatically faster than a single stream — and lets native media
//! players seek.

use std::io::SeekFrom;

use axum::extract::{Path, Query, State};
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use serde::Deserialize;
use tokio::io::{AsyncReadExt, AsyncSeekExt};
use tokio_util::io::ReaderStream;

use super::router::QuickCtx;
use super::state::RelayRange;

/// Read chunk size for streaming a file to the socket. Large chunks mean far
/// fewer poll/frame iterations than the default (~4 KiB), so big files fly.
const STREAM_CHUNK: usize = 1024 * 1024;

#[derive(Debug, Deserialize)]
pub struct DownloadQuery {
    #[serde(default)]
    pub token: String,
    /// Stable id of the requesting device, used to enforce recipient targeting.
    #[serde(default)]
    pub device: String,
}

pub async fn download_file(
    Path(id): Path<String>,
    Query(query): Query<DownloadQuery>,
    State(ctx): State<QuickCtx>,
    headers: HeaderMap,
) -> Response {
    if !ctx.manager.validate_token(&query.token) {
        return (StatusCode::UNAUTHORIZED, "invalid or missing token").into_response();
    }
    let item = match ctx.manager.get_item(&id) {
        Some(i) => i,
        None => return (StatusCode::NOT_FOUND, "not found").into_response(),
    };
    // Only the sender, the targeted device, or everyone-addressed items.
    if !item.visible_to(query.device.trim()) {
        return (StatusCode::FORBIDDEN, "not shared with this device").into_response();
    }

    // Live-relay (cut-through) gate: while this item is still uploading, only
    // serve byte ranges whose chunks have already landed and tell the client to
    // retry the rest (HTTP 425). Returns `None` for ordinary or finished items,
    // which fall through to the normal disk serve below.
    let req_range = headers
        .get(header::RANGE)
        .and_then(|v| v.to_str().ok())
        .and_then(|raw| parse_range(raw, item.size.max(1)));
    if let Some(RelayRange::TooEarly) = ctx.manager.relay_range_state(&id, req_range) {
        return (
            StatusCode::from_u16(425).unwrap_or(StatusCode::SERVICE_UNAVAILABLE),
            "slice not ready",
        )
            .into_response();
    }

    let path = match item.local_path.clone() {
        Some(p) => p,
        None => return (StatusCode::NOT_FOUND, "not a file").into_response(),
    };
    let mut file = match tokio::fs::File::open(&path).await {
        Ok(f) => f,
        Err(_) => return (StatusCode::NOT_FOUND, "file unavailable").into_response(),
    };
    // Authoritative size from disk (desktop-shared files are served in place).
    let total = match file.metadata().await {
        Ok(m) => m.len(),
        Err(_) => item.size,
    };

    let disposition = format!("attachment; filename=\"{}\"", ascii_fallback(&item.name));

    // Honor a single-range request (`bytes=start-end`) with 206 Partial Content.
    if total > 0 {
        if let Some(raw) = headers.get(header::RANGE).and_then(|v| v.to_str().ok()) {
            match parse_range(raw, total) {
                Some((start, end)) => {
                    let len = end - start + 1;
                    if file.seek(SeekFrom::Start(start)).await.is_err() {
                        return (StatusCode::INTERNAL_SERVER_ERROR, "seek failed")
                            .into_response();
                    }
                    let stream = ReaderStream::with_capacity(file.take(len), STREAM_CHUNK);
                    let body = axum::body::Body::from_stream(stream);
                    return Response::builder()
                        .status(StatusCode::PARTIAL_CONTENT)
                        .header(header::CONTENT_TYPE, item.mime.clone())
                        .header(header::CONTENT_LENGTH, len.to_string())
                        .header(header::ACCEPT_RANGES, "bytes")
                        .header(header::CONTENT_RANGE, format!("bytes {start}-{end}/{total}"))
                        .header(header::CONTENT_DISPOSITION, disposition)
                        .body(body)
                        .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response());
                }
                None => {
                    return Response::builder()
                        .status(StatusCode::RANGE_NOT_SATISFIABLE)
                        .header(header::CONTENT_RANGE, format!("bytes */{total}"))
                        .body(axum::body::Body::empty())
                        .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response());
                }
            }
        }
    }

    // Full file.
    let stream = ReaderStream::with_capacity(file, STREAM_CHUNK);
    let body = axum::body::Body::from_stream(stream);
    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, item.mime.clone())
        .header(header::CONTENT_LENGTH, total.to_string())
        .header(header::ACCEPT_RANGES, "bytes")
        .header(header::CONTENT_DISPOSITION, disposition)
        .body(body)
        .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response())
}

/// Parse a single HTTP byte range (`bytes=start-end`, `bytes=start-`, or
/// `bytes=-suffix`) against the known total size. Returns an inclusive
/// `(start, end)` or `None` if malformed / unsatisfiable.
fn parse_range(raw: &str, total: u64) -> Option<(u64, u64)> {
    let spec = raw.trim().strip_prefix("bytes=")?;
    // Only a single range is supported (no comma-separated multi-ranges).
    if spec.contains(',') {
        return None;
    }
    let (start_s, end_s) = spec.split_once('-')?;
    let (start_s, end_s) = (start_s.trim(), end_s.trim());

    if start_s.is_empty() {
        // Suffix range: the last N bytes.
        let n: u64 = end_s.parse().ok()?;
        if n == 0 {
            return None;
        }
        let n = n.min(total);
        return Some((total - n, total - 1));
    }

    let start: u64 = start_s.parse().ok()?;
    if start >= total {
        return None;
    }
    let end: u64 = if end_s.is_empty() {
        total - 1
    } else {
        end_s.parse::<u64>().ok()?.min(total - 1)
    };
    if start > end {
        return None;
    }
    Some((start, end))
}

/// Replace non-ASCII / quote characters so the value is safe inside a quoted
/// `Content-Disposition` filename. The browser's `download` attribute supplies
/// the real (unicode) name; this header is only a fallback.
fn ascii_fallback(name: &str) -> String {
    name.chars()
        .map(|c| {
            if c.is_ascii() && c != '"' && c != '\\' {
                c
            } else {
                '_'
            }
        })
        .collect()
}
