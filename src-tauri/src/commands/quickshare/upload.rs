//! `POST /upload` — stream one file from a browser onto the desktop disk
//! (auto-saved under Downloads/QuickShare) and add it to the shared tray.
//! Token-gated; the original filename is base64-encoded in the `x-filename`
//! header (avoids header charset issues) and sanitized to a single safe path
//! segment before it ever touches the filesystem.

use std::io::SeekFrom;
use std::net::SocketAddr;
use std::path::Path;

use axum::body::Body;
use axum::extract::{ConnectInfo, Query, State};
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::Json;
use base64::Engine;
use futures_util::StreamExt;
use serde::Deserialize;
use serde_json::json;
use tokio::fs::OpenOptions;
use tokio::io::{AsyncSeekExt, AsyncWriteExt, BufWriter};

use super::events::fan_out_tray;
use super::router::QuickCtx;
use super::state::UploadTake;
use super::types::TrayItem;
use super::util::{guess_mime, sanitize_filename, unique_path};

/// Disk write buffer — coalesces the many small inbound body chunks into large
/// sequential writes so big files land fast.
const WRITE_BUFFER: usize = 1024 * 1024;

#[derive(Debug, Deserialize)]
pub struct UploadQuery {
    #[serde(default)]
    pub token: String,
    /// Stable id of the sending device (so the sender always sees its own item).
    #[serde(default)]
    pub device: String,
    /// Recipient: a device id, or "everyone" (the default when omitted).
    #[serde(default)]
    pub to: String,
    /// Friendly sender name for display.
    #[serde(default)]
    pub name: String,
}

pub async fn upload_file(
    Query(query): Query<UploadQuery>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(ctx): State<QuickCtx>,
    headers: HeaderMap,
    body: Body,
) -> Response {
    if !ctx.manager.validate_token(&query.token) {
        return (StatusCode::UNAUTHORIZED, "invalid or missing token").into_response();
    }
    let storage_dir = match ctx.manager.storage_dir() {
        Some(d) => d,
        None => return (StatusCode::SERVICE_UNAVAILABLE, "sharing not running").into_response(),
    };

    // Decode + sanitize the client-supplied filename (base64 in `x-filename`).
    let raw_name = headers
        .get("x-filename")
        .and_then(|v| v.to_str().ok())
        .and_then(|b64| base64::engine::general_purpose::STANDARD.decode(b64).ok())
        .and_then(|bytes| String::from_utf8(bytes).ok())
        .unwrap_or_default();
    let safe_name = sanitize_filename(&raw_name);

    // Prefer the request's declared content type; fall back to extension.
    let mime = headers
        .get(header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .filter(|s| !s.is_empty() && *s != "application/octet-stream")
        .map(|s| s.to_string())
        .unwrap_or_else(|| guess_mime(&safe_name));

    let dest = unique_path(Path::new(&storage_dir), &safe_name);
    let final_name = dest
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or(&safe_name)
        .to_string();

    // Stream the request body straight to disk (no full-file buffering) so even
    // large videos transfer without holding the whole file in memory. A large
    // BufWriter batches the many small body chunks into big sequential writes.
    let file = match tokio::fs::File::create(&dest).await {
        Ok(f) => f,
        Err(e) => {
            return (StatusCode::INTERNAL_SERVER_ERROR, format!("write failed: {e}"))
                .into_response()
        }
    };
    let mut writer = BufWriter::with_capacity(WRITE_BUFFER, file);
    let mut written: u64 = 0;
    let mut stream = body.into_data_stream();
    while let Some(chunk) = stream.next().await {
        match chunk {
            Ok(bytes) => {
                if writer.write_all(&bytes).await.is_err() {
                    let _ = tokio::fs::remove_file(&dest).await;
                    return (StatusCode::INTERNAL_SERVER_ERROR, "write failed").into_response();
                }
                written += bytes.len() as u64;
            }
            Err(_) => {
                let _ = tokio::fs::remove_file(&dest).await;
                return (StatusCode::BAD_REQUEST, "upload interrupted").into_response();
            }
        }
    }
    if writer.flush().await.is_err() {
        let _ = tokio::fs::remove_file(&dest).await;
        return (StatusCode::INTERNAL_SERVER_ERROR, "write failed").into_response();
    }

    // Who sent it / who it's for. Empty device falls back to the source IP so the
    // sender still recognizes its own item; empty `to` means everyone.
    let sender_id = {
        let d = query.device.trim();
        if d.is_empty() { addr.ip().to_string() } else { d.to_string() }
    };
    let sender_label = {
        let n = query.name.trim();
        if n.is_empty() { addr.ip().to_string() } else { n.to_string() }
    };

    let item = TrayItem::new_file(
        final_name,
        written,
        mime,
        sender_label,
        sender_id,
        query.to.clone(),
        dest.to_string_lossy().to_string(),
    );
    let id = item.id.clone();
    ctx.manager.add_item(item);
    fan_out_tray(&ctx.app, &ctx.manager);

    (StatusCode::OK, Json(json!({ "id": id }))).into_response()
}

// ── Parallel (multi-connection) chunked upload ──────────────────────────────
// A single TCP stream rarely saturates a Wi-Fi link, so a large video uploads
// slowly. Instead the browser slices the file and POSTs the pieces to
// `/upload/chunk` over several connections at once; each piece is written
// straight to its byte offset in one shared temp file (no reassembly pass).
// `/upload/finish` then renames the completed file into place and publishes the
// tray item; `/upload/abort` discards a failed transfer.

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChunkQuery {
    #[serde(default)]
    pub token: String,
    #[serde(default)]
    pub upload_id: String,
    /// Chunk ordinal (used to track completion).
    #[serde(default)]
    pub index: u32,
    /// Byte offset of this chunk within the whole file.
    #[serde(default)]
    pub offset: u64,
    /// Total file size — used to pre-size the temp file once.
    #[serde(default)]
    pub total: u64,
    /// Total number of chunks — the upload is complete once all have arrived.
    #[serde(default)]
    pub chunks: u32,
}

pub async fn upload_chunk(
    Query(q): Query<ChunkQuery>,
    State(ctx): State<QuickCtx>,
    body: Body,
) -> Response {
    if !ctx.manager.validate_token(&q.token) {
        return (StatusCode::UNAUTHORIZED, "invalid or missing token").into_response();
    }
    let storage_dir = match ctx.manager.storage_dir() {
        Some(d) => d,
        None => return (StatusCode::SERVICE_UNAVAILABLE, "sharing not running").into_response(),
    };
    if q.upload_id.is_empty() || q.chunks == 0 {
        return (StatusCode::BAD_REQUEST, "missing upload id").into_response();
    }

    let temp = match ctx
        .manager
        .upload_prepare(&q.upload_id, &storage_dir, q.total, q.chunks)
    {
        Ok(p) => p,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, e).into_response(),
    };

    // Each chunk uses its own handle + seek, so disjoint ranges write in
    // parallel safely.
    let mut file = match OpenOptions::new().write(true).open(&temp).await {
        Ok(f) => f,
        Err(e) => {
            return (StatusCode::INTERNAL_SERVER_ERROR, format!("open failed: {e}")).into_response()
        }
    };
    if file.seek(SeekFrom::Start(q.offset)).await.is_err() {
        return (StatusCode::INTERNAL_SERVER_ERROR, "seek failed").into_response();
    }
    let mut writer = BufWriter::with_capacity(WRITE_BUFFER, file);
    let mut stream = body.into_data_stream();
    while let Some(chunk) = stream.next().await {
        match chunk {
            Ok(bytes) => {
                if writer.write_all(&bytes).await.is_err() {
                    return (StatusCode::INTERNAL_SERVER_ERROR, "write failed").into_response();
                }
            }
            Err(_) => return (StatusCode::BAD_REQUEST, "chunk interrupted").into_response(),
        }
    }
    if writer.flush().await.is_err() {
        return (StatusCode::INTERNAL_SERVER_ERROR, "write failed").into_response();
    }

    ctx.manager.upload_mark(&q.upload_id, q.index);
    (StatusCode::OK, Json(json!({ "ok": true }))).into_response()
}

// ── Live relay (cut-through) for a chunked transfer addressed to one device ──
// `/upload/begin` announces the item and creates its final file *before* any
// bytes arrive, so the recipient can start pulling each slice the moment it
// lands (see the download route's range gate) instead of waiting for the whole
// upload to finish first. Only used for targeted transfers; everyone-addressed
// and small single uploads keep publishing once complete.

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BeginQuery {
    #[serde(default)]
    pub token: String,
    #[serde(default)]
    pub upload_id: String,
    #[serde(default)]
    pub total: u64,
    #[serde(default)]
    pub chunks: u32,
    /// Per-chunk size, so the download route can map a byte range to a chunk.
    #[serde(default)]
    pub chunk_size: u64,
    #[serde(default)]
    pub device: String,
    #[serde(default)]
    pub to: String,
    #[serde(default)]
    pub name: String,
}

pub async fn begin_upload(
    Query(q): Query<BeginQuery>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(ctx): State<QuickCtx>,
    headers: HeaderMap,
) -> Response {
    if !ctx.manager.validate_token(&q.token) {
        return (StatusCode::UNAUTHORIZED, "invalid or missing token").into_response();
    }
    let storage_dir = match ctx.manager.storage_dir() {
        Some(d) => d,
        None => return (StatusCode::SERVICE_UNAVAILABLE, "sharing not running").into_response(),
    };
    if q.upload_id.is_empty() || q.chunks == 0 || q.total == 0 {
        return (StatusCode::BAD_REQUEST, "missing upload id").into_response();
    }

    let raw_name = decode_filename(&headers);
    let safe_name = sanitize_filename(&raw_name);
    let mime = headers
        .get(header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .filter(|s| !s.is_empty() && *s != "application/octet-stream")
        .map(|s| s.to_string())
        .unwrap_or_else(|| guess_mime(&safe_name));

    let dest = unique_path(Path::new(&storage_dir), &safe_name);
    let final_name = dest
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or(&safe_name)
        .to_string();

    if let Err(e) = ctx
        .manager
        .upload_begin(&q.upload_id, &dest, q.total, q.chunks, q.chunk_size)
    {
        return (StatusCode::INTERNAL_SERVER_ERROR, e).into_response();
    }

    let sender_id = {
        let d = q.device.trim();
        if d.is_empty() { addr.ip().to_string() } else { d.to_string() }
    };
    let sender_label = {
        let n = q.name.trim();
        if n.is_empty() { addr.ip().to_string() } else { n.to_string() }
    };

    let mut item = TrayItem::new_file(
        final_name,
        q.total,
        mime,
        sender_label,
        sender_id,
        q.to.clone(),
        dest.to_string_lossy().to_string(),
    );
    // The tray item id must equal the upload id so the relay's arriving slices
    // and the download route line up on one id.
    item.id = q.upload_id.clone();
    ctx.manager.add_item(item);
    fan_out_tray(&ctx.app, &ctx.manager);

    (StatusCode::OK, Json(json!({ "id": q.upload_id }))).into_response()
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FinishQuery {
    #[serde(default)]
    pub token: String,
    #[serde(default)]
    pub upload_id: String,
    #[serde(default)]
    pub device: String,
    #[serde(default)]
    pub to: String,
    #[serde(default)]
    pub name: String,
}

pub async fn upload_finish(
    Query(q): Query<FinishQuery>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(ctx): State<QuickCtx>,
    headers: HeaderMap,
) -> Response {
    if !ctx.manager.validate_token(&q.token) {
        return (StatusCode::UNAUTHORIZED, "invalid or missing token").into_response();
    }
    let storage_dir = match ctx.manager.storage_dir() {
        Some(d) => d,
        None => return (StatusCode::SERVICE_UNAVAILABLE, "sharing not running").into_response(),
    };

    let (temp_path, total) = match ctx.manager.upload_take_if_complete(&q.upload_id) {
        UploadTake::Complete { temp_path, total } => (temp_path, total),
        UploadTake::Incomplete => return (StatusCode::CONFLICT, "upload incomplete").into_response(),
        UploadTake::Missing => return (StatusCode::NOT_FOUND, "unknown upload").into_response(),
    };

    // Live-relay finish: the item was already announced at `/upload/begin` and
    // its bytes were written straight to their final path, so there is nothing
    // to move. The session is now gone, so the download route serves the
    // finished file from disk like any other. Just confirm completion.
    if ctx.manager.get_item(&q.upload_id).is_some() {
        fan_out_tray(&ctx.app, &ctx.manager);
        return (StatusCode::OK, Json(json!({ "id": q.upload_id }))).into_response();
    }

    let raw_name = decode_filename(&headers);
    let safe_name = sanitize_filename(&raw_name);
    let mime = headers
        .get(header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .filter(|s| !s.is_empty() && *s != "application/octet-stream")
        .map(|s| s.to_string())
        .unwrap_or_else(|| guess_mime(&safe_name));

    let dest = unique_path(Path::new(&storage_dir), &safe_name);
    let final_name = dest
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or(&safe_name)
        .to_string();

    if let Err(e) = tokio::fs::rename(&temp_path, &dest).await {
        let _ = tokio::fs::remove_file(&temp_path).await;
        return (StatusCode::INTERNAL_SERVER_ERROR, format!("finalize failed: {e}"))
            .into_response();
    }

    let sender_id = {
        let d = q.device.trim();
        if d.is_empty() { addr.ip().to_string() } else { d.to_string() }
    };
    let sender_label = {
        let n = q.name.trim();
        if n.is_empty() { addr.ip().to_string() } else { n.to_string() }
    };

    let item = TrayItem::new_file(
        final_name,
        total,
        mime,
        sender_label,
        sender_id,
        q.to.clone(),
        dest.to_string_lossy().to_string(),
    );
    let id = item.id.clone();
    ctx.manager.add_item(item);
    fan_out_tray(&ctx.app, &ctx.manager);
    (StatusCode::OK, Json(json!({ "id": id }))).into_response()
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AbortQuery {
    #[serde(default)]
    pub token: String,
    #[serde(default)]
    pub upload_id: String,
}

pub async fn upload_abort(Query(q): Query<AbortQuery>, State(ctx): State<QuickCtx>) -> Response {
    if !ctx.manager.validate_token(&q.token) {
        return (StatusCode::UNAUTHORIZED, "invalid or missing token").into_response();
    }
    // Drop a half-written relay item from the tray (its partial file is removed
    // with the session just below).
    if ctx.manager.remove_item(&q.upload_id) {
        fan_out_tray(&ctx.app, &ctx.manager);
    }
    ctx.manager.upload_abort(&q.upload_id);
    (StatusCode::OK, Json(json!({ "ok": true }))).into_response()
}

/// Decode the base64 `x-filename` header into a UTF-8 name (empty if absent).
fn decode_filename(headers: &HeaderMap) -> String {
    headers
        .get("x-filename")
        .and_then(|v| v.to_str().ok())
        .and_then(|b64| base64::engine::general_purpose::STANDARD.decode(b64).ok())
        .and_then(|bytes| String::from_utf8(bytes).ok())
        .unwrap_or_default()
}
