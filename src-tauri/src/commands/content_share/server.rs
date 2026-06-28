//! Start/stop lifecycle for the embedded Content Share server. Binds an axum
//! HTTP server to both IPv4 (`0.0.0.0`) and, best-effort, IPv6 (`::`) so other
//! Genisys devices on the same LAN can deliver shared books/notes regardless of
//! which address family they were discovered at. Registers an mDNS
//! advertisement so this device is discoverable, and tears it all down on stop.

use std::net::SocketAddr;
use std::sync::Arc;

use axum::Router;
use mdns_sd::ServiceDaemon;
use tauri::AppHandle;
use tokio::net::TcpListener;
use tokio::sync::broadcast;

use crate::database::Database;
use crate::messaging::network::detect_local_ip;

use super::discovery::{advertise, browse};
use super::router::{build_router, ShareCtx};
use super::state::ContentShareManager;
use super::types::ContentShareStatus;

/// Preferred port; falls back to an OS-assigned port if taken. (Remote Terminal
/// 9777, Monitor 9778, QuickShare 9779; Content Share uses the next port.)
const PREFERRED_PORT: u16 = 9780;

/// Start the Content Share service: bind the HTTP server and register mDNS.
pub async fn start_server(
    app: AppHandle,
    manager: ContentShareManager,
    db: Arc<Database>,
) -> Result<ContentShareStatus, String> {
    if manager.is_running() {
        return Ok(manager.status());
    }

    let ip = detect_local_ip()
        .ok_or_else(|| "Could not determine this machine's LAN IP address".to_string())?;

    let v4_listener = bind_listener(PREFERRED_PORT).await?;
    let port = v4_listener
        .local_addr()
        .map_err(|e| format!("Failed to read bound address: {e}"))?
        .port();
    // Best-effort second listener on the same port over IPv6, so a peer that
    // discovered us at an IPv6 address can still reach us. On Windows/macOS the
    // v4 and v6 sockets are independent; if this fails we stay IPv4-only.
    let v6_listener = TcpListener::bind(("::", port)).await.ok();

    let (shutdown_tx, _) = broadcast::channel::<()>(1);

    // Register mDNS so peers can discover us, and browse for peers ourselves.
    let daemon = ServiceDaemon::new().map_err(|e| format!("mDNS init failed: {e}"))?;
    let instance = instance_name(&manager.device_id());
    advertise(&daemon, &instance, port, &ip, &manager.device_id(), &manager.device_name())?;
    browse(&daemon, app.clone(), manager.clone())?;

    manager.mark_started(ip.clone(), port, shutdown_tx.clone(), daemon);

    let ctx = ShareCtx {
        app: app.clone(),
        manager: manager.clone(),
        db,
    };
    spawn_server(v4_listener, build_router(ctx.clone()), shutdown_tx.subscribe());
    if let Some(v6) = v6_listener {
        spawn_server(v6, build_router(ctx), shutdown_tx.subscribe());
        log::info!("[content-share] also listening on IPv6 (port {port})");
    }

    log::info!("[content-share] started at http://{ip}:{port}");
    Ok(manager.status())
}

/// Serve `router` on `listener` until the shared shutdown signal fires.
fn spawn_server(listener: TcpListener, router: Router, mut shutdown_rx: broadcast::Receiver<()>) {
    tokio::spawn(async move {
        let service = router.into_make_service_with_connect_info::<SocketAddr>();
        if let Err(e) = axum::serve(listener, service)
            .with_graceful_shutdown(async move {
                let _ = shutdown_rx.recv().await;
            })
            .await
        {
            log::warn!("[content-share] server error: {e}");
        }
    });
}

/// Bind to the preferred port on all interfaces, falling back to an
/// OS-assigned ephemeral port if it is unavailable.
async fn bind_listener(preferred: u16) -> Result<TcpListener, String> {
    if preferred != 0 {
        if let Ok(listener) = TcpListener::bind(("0.0.0.0", preferred)).await {
            return Ok(listener);
        }
    }
    TcpListener::bind(("0.0.0.0", 0))
        .await
        .map_err(|e| format!("Failed to bind Content Share server: {e}"))
}

/// Stop the service: trigger graceful shutdown and drop the mDNS daemon. Safe to
/// call when not running (no-op).
pub async fn stop_server(manager: ContentShareManager) {
    if let Some(tx) = manager.take_for_stop() {
        let _ = tx.send(());
        log::info!("[content-share] stopped");
    }
}

/// A stable, short mDNS instance name derived from the device id.
fn instance_name(device_id: &str) -> String {
    let short: String = device_id.chars().take(8).collect();
    if short.is_empty() {
        "genisys-share".to_string()
    } else {
        format!("genisys-share-{short}")
    }
}
