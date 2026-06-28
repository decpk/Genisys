//! Accept inbound TCP connections and run the responder handshake + session.

use std::sync::Arc;

use tauri::{AppHandle, Emitter};
use tokio::net::TcpListener;

use crate::messaging::manager::ManagerInner;
use crate::messaging::transport::perform_handshake_responder::perform_handshake_responder;
use crate::messaging::transport::run_session::run_session;
use crate::messaging::types::SessionRole;

/// Loops forever accepting connections. Each connection is handshaken and
/// driven on its own task so a single bad peer can't stall the listener.
pub async fn accept_loop(app: AppHandle, inner: Arc<ManagerInner>, listener: TcpListener) {
    loop {
        let (stream, addr) = match listener.accept().await {
            Ok(pair) => pair,
            Err(_) => continue,
        };
        let app = app.clone();
        let inner = inner.clone();
        tokio::spawn(async move {
            let mut stream = stream;
            let private_key = inner.private_key();
            match perform_handshake_responder(&mut stream, &private_key).await {
                Ok((transport, pubkey)) => {
                    let peer_id = hex::encode(&pubkey);
                    let host = addr.ip().to_string();
                    let verified = inner.trust_verified(&peer_id);
                    let key_changed = inner.check_host_key_changed(&host, &peer_id);
                    let result = run_session(
                        app.clone(), inner, SessionRole::Responder, peer_id, pubkey, host,
                        addr.port(), verified, key_changed, stream, transport,
                    )
                    .await;
                    if let Err(e) = result {
                        let _ = app.emit("msg-error", serde_json::json!({ "peerId": serde_json::Value::Null, "error": e }));
                    }
                }
                Err(e) => {
                    let _ = app.emit("msg-error", serde_json::json!({ "peerId": serde_json::Value::Null, "error": e }));
                }
            }
        });
    }
}
