//! Sender side: deliver an assembled bundle to a peer Genisys device over HTTP.
//! Two steps — announce the offer (which blocks on the peer's approval) and, if
//! accepted, upload the zip with the returned one-time token.

use std::time::Duration;

use reqwest::Client;
use tauri::{AppHandle, Emitter};

use super::types::{SendProgress, ShareOffer, ShareOfferResponse, SharePeer};

/// Result of a send attempt.
pub struct SendOutcome {
    /// `false` when the receiver declined the offer.
    pub accepted: bool,
}

/// POST the offer to `peer`, wait for the accept/decline decision, then (if
/// accepted) upload the bundle bytes with the one-time token. Emits
/// `content-share-send-progress` events (keyed by `device_id`) so the UI can
/// show a waiting state and then an upload progress bar.
pub async fn send_bundle(
    app: &AppHandle,
    peer: &SharePeer,
    offer: &ShareOffer,
    zip_bytes: Vec<u8>,
    device_id: &str,
) -> Result<SendOutcome, String> {
    let client = Client::builder()
        .build()
        .map_err(|e| format!("http client init failed: {e}"))?;
    // Bracket bare IPv6 hosts so the URL parses (e.g. http://[fe80::1]:9780).
    let host = if peer.host.contains(':') && !peer.host.starts_with('[') {
        format!("[{}]", peer.host)
    } else {
        peer.host.clone()
    };
    let base = format!("http://{}:{}", host, peer.port);

    // Signal the UI that we're now waiting on the peer's accept/decline.
    let _ = app.emit(
        "content-share-send-progress",
        SendProgress {
            device_id: device_id.to_string(),
            phase: "waiting".to_string(),
            sent: 0,
            total: 0,
        },
    );

    // Step 1: offer (the receiver blocks this until the user decides).
    let resp = client
        .post(format!("{base}/share/offer"))
        .timeout(Duration::from_secs(70))
        .json(offer)
        .send()
        .await
        .map_err(|e| format!("could not reach device: {e}"))?;
    if !resp.status().is_success() {
        return Err(format!("offer rejected: HTTP {}", resp.status()));
    }
    let offer_resp: ShareOfferResponse = resp
        .json()
        .await
        .map_err(|e| format!("invalid offer response: {e}"))?;
    if !offer_resp.accepted {
        return Ok(SendOutcome { accepted: false });
    }
    let token = offer_resp
        .upload_token
        .ok_or_else(|| "device accepted but sent no upload token".to_string())?;

    // Step 2: upload the bundle as a stream so we can report byte progress.
    let total = zip_bytes.len() as u64;
    const CHUNK: usize = 64 * 1024;
    let chunks: Vec<Vec<u8>> = zip_bytes.chunks(CHUNK).map(|c| c.to_vec()).collect();
    let app_progress = app.clone();
    let dev = device_id.to_string();
    let body_stream = futures_util::stream::unfold(
        (0usize, 0u64, chunks),
        move |(idx, sent, chunks)| {
            let app_progress = app_progress.clone();
            let dev = dev.clone();
            async move {
                if idx >= chunks.len() {
                    return None;
                }
                let chunk = chunks[idx].clone();
                let sent = sent + chunk.len() as u64;
                let _ = app_progress.emit(
                    "content-share-send-progress",
                    SendProgress {
                        device_id: dev.clone(),
                        phase: "uploading".to_string(),
                        sent,
                        total,
                    },
                );
                Some((Ok::<Vec<u8>, std::io::Error>(chunk), (idx + 1, sent, chunks)))
            }
        },
    );

    let resp = client
        .post(format!("{base}/share/upload"))
        .query(&[("token", token.as_str())])
        .timeout(Duration::from_secs(600))
        .body(reqwest::Body::wrap_stream(body_stream))
        .send()
        .await
        .map_err(|e| format!("upload failed: {e}"))?;
    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("upload rejected: HTTP {status} {text}"));
    }

    Ok(SendOutcome { accepted: true })
}
