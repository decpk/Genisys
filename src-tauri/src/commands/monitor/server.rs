//! Start/stop lifecycle for the embedded Monitor server. Binds an axum HTTP +
//! WebSocket server to `0.0.0.0` so devices on the same LAN can reach the viewer
//! page, and tears it down (including disconnecting clients) on stop.

use std::net::SocketAddr;

use tauri::AppHandle;
use tokio::net::TcpListener;
use tokio::sync::oneshot;

use crate::messaging::network::detect_local_ip;

use super::auth::generate_token;
use super::router::{build_router, MonitorCtx};
use super::state::MonitorManager;
use super::types::MonitorStartInfo;

/// Preferred port; falls back to an OS-assigned port if it is taken. The actual
/// port is always carried in the QR URL, so any value works. (Remote Terminal
/// uses 9777; Monitor uses the next port so both can run at once.)
const PREFERRED_PORT: u16 = 9778;

/// Start sharing. Returns the URL (with embedded token), LAN IP, port, and token.
pub async fn start_server(
    app: AppHandle,
    manager: MonitorManager,
    requested_port: Option<u16>,
) -> Result<MonitorStartInfo, String> {
    if manager.is_running() {
        return Err("Monitor sharing is already running".into());
    }

    let ip = detect_local_ip()
        .ok_or_else(|| "Could not determine this machine's LAN IP address".to_string())?;

    let listener = bind_listener(requested_port.unwrap_or(PREFERRED_PORT)).await?;
    let port = listener
        .local_addr()
        .map_err(|e| format!("Failed to read bound address: {e}"))?
        .port();

    let token = generate_token();
    let router = build_router(MonitorCtx {
        app: app.clone(),
        manager: manager.clone(),
    });

    let (shutdown_tx, shutdown_rx) = oneshot::channel::<()>();
    manager.mark_started(ip.clone(), port, token.clone(), shutdown_tx);

    tokio::spawn(async move {
        let service = router.into_make_service_with_connect_info::<SocketAddr>();
        if let Err(e) = axum::serve(listener, service)
            .with_graceful_shutdown(async move {
                let _ = shutdown_rx.await;
            })
            .await
        {
            log::warn!("[monitor] server error: {e}");
        }
    });

    let url = format!("http://{ip}:{port}/?token={token}");
    log::info!("[monitor] sharing started at http://{ip}:{port}");
    Ok(MonitorStartInfo {
        url,
        ip,
        port,
        token,
    })
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
        .map_err(|e| format!("Failed to bind Monitor server: {e}"))
}

/// Stop sharing: disconnect all clients, deny pending approvals, and trigger the
/// server's graceful shutdown. Safe to call when not running (no-op).
pub async fn stop_server(manager: MonitorManager) {
    let (shutdown, closes) = manager.take_for_stop();
    for close in closes {
        let _ = close.send(true);
    }
    if let Some(tx) = shutdown {
        let _ = tx.send(());
        log::info!("[monitor] sharing stopped");
    }
}
