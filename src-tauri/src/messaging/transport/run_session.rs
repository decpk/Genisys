//! Drive an established encrypted session: Hello exchange, an approval gate
//! (chat request accept/reject), then the reader/writer message loops.

use std::sync::Arc;
use std::time::Duration;

use snow::TransportState;
use tauri::{AppHandle, Emitter};
use tokio::net::tcp::{OwnedReadHalf, OwnedWriteHalf};
use tokio::net::TcpStream;
use tokio::sync::mpsc;
use tokio::sync::oneshot;
use tokio::sync::Mutex;

use crate::messaging::crypto::{fingerprint, safety_number};
use crate::messaging::manager::ManagerInner;
use crate::messaging::transport::handle_incoming::handle_incoming;
use crate::messaging::transport::recv_logical::recv_logical;
use crate::messaging::transport::send_logical::send_logical;
use crate::messaging::types::{
    Control, Hello, MsgPeer, SessionHandle, SessionRole, WireMessage, MAX_LOGICAL_MESSAGE,
};

/// How long a responder waits for the user to accept/reject before declining.
const REQUEST_TIMEOUT: Duration = Duration::from_secs(120);

/// Runs a full session lifecycle and emits status via events. Returns once the
/// session is established (and its reader/writer tasks spawned) or once it is
/// rejected/closed during the approval gate.
#[allow(clippy::too_many_arguments)]
pub async fn run_session(
    app: AppHandle,
    inner: Arc<ManagerInner>,
    role: SessionRole,
    peer_id: String,
    pubkey: Vec<u8>,
    host: String,
    fallback_port: u16,
    verified: bool,
    key_changed: bool,
    stream: TcpStream,
    transport: TransportState,
) -> Result<(), String> {
    let shared: Arc<Mutex<TransportState>> = Arc::new(Mutex::new(transport));
    let (mut read_half, mut write_half) = stream.into_split();

    // First transport message each side sends/receives is a Hello.
    let our_hello = inner.build_hello();
    let hello_bytes = serde_json::to_vec(&our_hello).map_err(|e| e.to_string())?;
    send_logical(&shared, &mut write_half, &hello_bytes).await?;
    let peer_hello_bytes = recv_logical(&shared, &mut read_half, MAX_LOGICAL_MESSAGE).await?;
    let peer_hello: Hello = serde_json::from_slice(&peer_hello_bytes).map_err(|e| e.to_string())?;

    let display_name = if peer_hello.display_name.is_empty() {
        peer_id.chars().take(8).collect()
    } else {
        peer_hello.display_name.clone()
    };
    let port = if peer_hello.listen_port > 0 { peer_hello.listen_port } else { fallback_port };
    inner.record_trust(&peer_id, &display_name);

    let safety = safety_number(&inner.our_pub_bytes(), &pubkey);
    let mut peer = MsgPeer {
        id: peer_id.clone(),
        public_key: base64::Engine::encode(&base64::engine::general_purpose::STANDARD, &pubkey),
        display_name: display_name.clone(),
        host,
        port,
        status: "connecting".to_string(),
        verified,
        key_changed,
        safety_number: Some(safety.clone()),
    };

    // Approval gate — the user must accept incoming chat requests, and the
    // dialer waits in a pending state until the remote accepts.
    let accepted = match role {
        SessionRole::Responder => {
            responder_gate(
                &app, &inner, &peer_id, &display_name, &pubkey, &peer, &safety,
                &shared, &mut write_half,
            )
            .await?
        }
        SessionRole::Initiator => {
            initiator_gate(&app, &mut peer, &shared, &mut read_half).await?
        }
    };

    if !accepted {
        return Ok(());
    }

    // Accepted: enter the encrypted message loops.
    peer.status = "connected".to_string();
    spawn_loops(app, inner, peer, peer_id, shared, read_half, write_half);
    Ok(())
}

/// Responder side: emit a chat request, wait for the user's decision, and tell
/// the dialer the outcome. Returns whether the session was accepted.
#[allow(clippy::too_many_arguments)]
async fn responder_gate(
    app: &AppHandle,
    inner: &Arc<ManagerInner>,
    peer_id: &str,
    display_name: &str,
    pubkey: &[u8],
    peer: &MsgPeer,
    safety: &str,
    shared: &Arc<Mutex<TransportState>>,
    write_half: &mut OwnedWriteHalf,
) -> Result<bool, String> {
    let (tx, rx) = oneshot::channel::<bool>();
    inner.register_request(peer_id, tx);

    let _ = app.emit(
        "msg-request",
        serde_json::json!({
            "peerId": peer_id,
            "displayName": display_name,
            "fingerprint": fingerprint(pubkey),
            "host": peer.host,
            "port": peer.port,
            "safetyNumber": safety,
        }),
    );

    // Tell the dialer we're waiting on the user.
    send_control(shared, write_half, "pending").await?;

    let decision = match tokio::time::timeout(REQUEST_TIMEOUT, rx).await {
        Ok(Ok(d)) => d,
        _ => false,
    };
    inner.take_request(peer_id);
    let _ = app.emit("msg-request-resolved", serde_json::json!({ "peerId": peer_id }));

    let outcome = if decision { "accepted" } else { "rejected" };
    send_control(shared, write_half, outcome).await?;
    Ok(decision)
}

/// Initiator side: read control frames until the responder accepts or rejects.
/// Surfaces the pending state to the UI while waiting.
async fn initiator_gate(
    app: &AppHandle,
    peer: &mut MsgPeer,
    shared: &Arc<Mutex<TransportState>>,
    read_half: &mut OwnedReadHalf,
) -> Result<bool, String> {
    loop {
        let bytes = recv_logical(shared, read_half, MAX_LOGICAL_MESSAGE).await?;
        let control: Control = serde_json::from_slice(&bytes).map_err(|e| e.to_string())?;
        match control.decision.as_str() {
            "accepted" => return Ok(true),
            "pending" => {
                peer.status = "pending".to_string();
                let _ = app.emit("msg-peer-updated", &*peer);
            }
            "rejected" => {
                peer.status = "disconnected".to_string();
                let _ = app.emit("msg-peer-updated", &*peer);
                let _ = app.emit(
                    "msg-error",
                    serde_json::json!({ "peerId": peer.id, "error": "Chat request was declined." }),
                );
                return Ok(false);
            }
            _ => {}
        }
    }
}

async fn send_control(
    shared: &Arc<Mutex<TransportState>>,
    write_half: &mut OwnedWriteHalf,
    decision: &str,
) -> Result<(), String> {
    let control = Control { decision: decision.to_string() };
    let bytes = serde_json::to_vec(&control).map_err(|e| e.to_string())?;
    send_logical(shared, write_half, &bytes).await
}

/// Spawns the reader/writer tasks for an accepted session, registers it on the
/// manager and emits the `connected` status.
fn spawn_loops(
    app: AppHandle,
    inner: Arc<ManagerInner>,
    peer: MsgPeer,
    peer_id: String,
    shared: Arc<Mutex<TransportState>>,
    mut read_half: OwnedReadHalf,
    mut write_half: OwnedWriteHalf,
) {
    let (tx, mut rx) = mpsc::unbounded_channel::<WireMessage>();

    // Writer task: drains the channel and encrypts each message.
    let writer_transport = shared.clone();
    let writer = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            let bytes = match serde_json::to_vec(&msg) {
                Ok(b) => b,
                Err(_) => continue,
            };
            if send_logical(&writer_transport, &mut write_half, &bytes).await.is_err() {
                break;
            }
        }
    });

    // Reader task: decrypts logical messages and dispatches events.
    let reader_app = app.clone();
    let reader_inner = inner.clone();
    let reader_pid = peer_id.clone();
    let reader = tokio::spawn(async move {
        loop {
            match recv_logical(&shared, &mut read_half, MAX_LOGICAL_MESSAGE).await {
                Ok(bytes) => handle_incoming(&reader_app, &reader_pid, &bytes).await,
                Err(_) => break,
            }
        }
        // Connection closed: clean up and notify the UI once.
        if let Some(handle) = reader_inner.remove_session(&reader_pid) {
            let mut lost = handle.peer.clone();
            lost.status = "disconnected".to_string();
            let _ = reader_app.emit("msg-peer-updated", &lost);
        }
        writer.abort();
    });

    inner.insert_session(SessionHandle { peer: peer.clone(), tx, reader });
    let _ = app.emit("msg-peer-updated", &peer);
}
