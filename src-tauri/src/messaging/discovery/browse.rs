//! Browse the LAN for other Genisys Messages instances via mDNS.

use std::sync::Arc;

use base64::{engine::general_purpose::STANDARD, Engine};
use mdns_sd::{ServiceDaemon, ServiceEvent};
use tauri::{AppHandle, Emitter};

use crate::messaging::manager::ManagerInner;
use crate::messaging::types::{MsgPeer, SERVICE_TYPE};

/// Spawns a task that watches for resolved/removed services and keeps the
/// manager's discovered map in sync, emitting `msg-peer-discovered` /
/// `msg-peer-lost`. Skips our own advertisement by matching the public key.
pub fn browse(daemon: &ServiceDaemon, app: AppHandle, inner: Arc<ManagerInner>) -> Result<(), String> {
    let receiver = daemon.browse(SERVICE_TYPE).map_err(|e| e.to_string())?;
    tokio::spawn(async move {
        while let Ok(event) = receiver.recv_async().await {
            match event {
                ServiceEvent::ServiceResolved(info) => on_resolved(&app, &inner, &info),
                ServiceEvent::ServiceRemoved(_ty, fullname) => {
                    if let Some(peer_id) = inner.remove_discovered_by_fullname(&fullname) {
                        let _ = app.emit("msg-peer-lost", serde_json::json!({ "peerId": peer_id }));
                    }
                }
                _ => {}
            }
        }
    });
    Ok(())
}

fn on_resolved(app: &AppHandle, inner: &Arc<ManagerInner>, info: &mdns_sd::ServiceInfo) {
    let pk_b64 = match info.get_property_val_str("pk") {
        Some(v) if !v.is_empty() => v.to_string(),
        _ => return,
    };
    if pk_b64 == inner.our_pub_b64() {
        return; // our own advertisement
    }
    let pubkey = match STANDARD.decode(&pk_b64) {
        Ok(b) => b,
        Err(_) => return,
    };
    let host = match info.get_addresses().iter().next() {
        Some(addr) => addr.to_string(),
        None => return,
    };
    let display_name = info
        .get_property_val_str("dn")
        .filter(|s| !s.is_empty())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "Genisys User".to_string());

    let peer_id = hex::encode(&pubkey);
    let peer = MsgPeer {
        id: peer_id.clone(),
        public_key: pk_b64,
        display_name,
        host,
        port: info.get_port(),
        status: "discovered".to_string(),
        verified: inner.trust_verified(&peer_id),
        key_changed: false,
        safety_number: None,
    };

    inner.record_mdns_name(info.get_fullname(), &peer_id);
    inner.upsert_discovered(peer.clone());
    let _ = app.emit("msg-peer-discovered", &peer);
}
