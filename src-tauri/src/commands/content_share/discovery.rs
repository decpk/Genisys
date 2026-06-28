//! LAN discovery for Content Share via mDNS. Advertises this device under
//! `_genisys-share._tcp.local.` (TXT: `id`, `name`) and browses for other Genisys
//! devices, keeping the manager's peer list in sync and emitting
//! `content-share-devices-changed` so the desktop picker refreshes live.

use std::collections::HashMap;

use mdns_sd::{ServiceDaemon, ServiceEvent, ServiceInfo};
use tauri::{AppHandle, Emitter};

use super::state::ContentShareManager;
use super::types::SharePeer;

/// mDNS service type for Content Share — distinct from Messaging's
/// `_genisys-msg._tcp.local.` so the two features discover independently.
pub const SERVICE_TYPE: &str = "_genisys-share._tcp.local.";

/// Register this device's `_genisys-share._tcp.local.` service. `enable_addr_auto`
/// lets the daemon fill in our LAN addresses automatically; we additionally
/// publish our detected LAN IPv4 as a `ip4` TXT property so peers can reach us
/// reliably even when the OS also advertises a global IPv6 that the router
/// isolates between clients.
pub fn advertise(
    daemon: &ServiceDaemon,
    instance: &str,
    port: u16,
    lan_ip: &str,
    device_id: &str,
    device_name: &str,
) -> Result<(), String> {
    let host_name = format!("{instance}.local.");
    let mut props: HashMap<String, String> = HashMap::new();
    props.insert("id".to_string(), device_id.to_string());
    props.insert("name".to_string(), device_name.to_string());
    if !lan_ip.is_empty() {
        props.insert("ip4".to_string(), lan_ip.to_string());
    }

    let info = ServiceInfo::new(SERVICE_TYPE, instance, &host_name, "", port, props)
        .map_err(|e| e.to_string())?
        .enable_addr_auto();
    daemon.register(info).map_err(|e| e.to_string())?;
    Ok(())
}

/// Spawn a task that watches for resolved/removed services and keeps the
/// manager's peer map in sync. Skips our own advertisement by device id.
pub fn browse(daemon: &ServiceDaemon, app: AppHandle, manager: ContentShareManager) -> Result<(), String> {
    let receiver = daemon.browse(SERVICE_TYPE).map_err(|e| e.to_string())?;
    tokio::spawn(async move {
        while let Ok(event) = receiver.recv_async().await {
            match event {
                ServiceEvent::ServiceResolved(info) => on_resolved(&app, &manager, &info),
                ServiceEvent::ServiceRemoved(_ty, fullname) => {
                    if manager.remove_peer_by_fullname(&fullname).is_some() {
                        let _ = app.emit("content-share-devices-changed", ());
                    }
                }
                _ => {}
            }
        }
    });
    Ok(())
}

fn on_resolved(app: &AppHandle, manager: &ContentShareManager, info: &ServiceInfo) {
    let device_id = match info.get_property_val_str("id") {
        Some(v) if !v.is_empty() => v.to_string(),
        _ => return,
    };
    if device_id == manager.device_id() {
        return; // our own advertisement
    }
    // Prefer the peer's self-reported LAN IPv4 (most reliable on home networks
    // where a global IPv6 may be isolated between clients). Fall back to any
    // IPv4 from the advertised address set, then the first address.
    let addrs = info.get_addresses();
    let host = info
        .get_property_val_str("ip4")
        .filter(|s| !s.is_empty())
        .map(|s| s.to_string())
        .or_else(|| addrs.iter().map(|addr| addr.to_string()).find(|s| !s.contains(':')))
        .or_else(|| addrs.iter().next().map(|addr| addr.to_string()));
    let host = match host {
        Some(h) => h,
        None => return,
    };
    let device_name = info
        .get_property_val_str("name")
        .filter(|s| !s.is_empty())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "Genisys Device".to_string());

    let peer = SharePeer {
        device_id,
        device_name,
        host,
        port: info.get_port(),
    };
    manager.upsert_peer(info.get_fullname(), peer);
    let _ = app.emit("content-share-devices-changed", ());
}
