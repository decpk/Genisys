//! Start/stop lifecycle for the embedded QuickShare server. Binds an axum HTTP +
//! WebSocket server to `0.0.0.0` so devices on the same LAN can reach it, and
//! tears it down (including disconnecting clients) on stop. Received uploads are
//! auto-saved under the user's Downloads/QuickShare folder.

use std::net::SocketAddr;
use std::path::PathBuf;

use tauri::AppHandle;
use tokio::net::TcpListener;
use tokio::sync::oneshot;

use crate::messaging::network::detect_local_ip;

use super::auth::generate_token;
use super::router::{build_router, QuickCtx};
use super::state::QuickShareManager;
use super::types::QuickShareStartInfo;

/// Preferred port; falls back to an OS-assigned port if it is taken. The actual
/// port is always carried in the QR URL, so any value works. (Remote Terminal
/// uses 9777, Monitor 9778; QuickShare uses the next port so all can run.)
const PREFERRED_PORT: u16 = 9779;

/// Start sharing. Returns the URL (with embedded token), LAN IP, port, token,
/// and the folder where received files are saved.
pub async fn start_server(
    app: AppHandle,
    manager: QuickShareManager,
    requested_port: Option<u16>,
) -> Result<QuickShareStartInfo, String> {
    if manager.is_running() {
        return Err("QuickShare is already running".into());
    }

    let ip = detect_local_ip()
        .ok_or_else(|| "Could not determine this machine's LAN IP address".to_string())?;

    let storage_dir = ensure_storage_dir()?;

    let listener = bind_listener(requested_port.unwrap_or(PREFERRED_PORT)).await?;
    let port = listener
        .local_addr()
        .map_err(|e| format!("Failed to read bound address: {e}"))?
        .port();

    let token = generate_token();
    let router = build_router(QuickCtx {
        app: app.clone(),
        manager: manager.clone(),
    });

    let (shutdown_tx, shutdown_rx) = oneshot::channel::<()>();
    manager.mark_started(ip.clone(), port, token.clone(), storage_dir.clone(), shutdown_tx);

    tokio::spawn(async move {
        let service = router.into_make_service_with_connect_info::<SocketAddr>();
        if let Err(e) = axum::serve(listener, service)
            .with_graceful_shutdown(async move {
                let _ = shutdown_rx.await;
            })
            .await
        {
            log::warn!("[quickshare] server error: {e}");
        }
    });

    let url = format!("http://{ip}:{port}/?token={token}");
    log::info!("[quickshare] sharing started at http://{ip}:{port}");
    Ok(QuickShareStartInfo {
        url,
        ip,
        port,
        token,
        storage_dir,
    })
}

/// Resolve and create the `Downloads/QuickShare` folder, falling back to the
/// system temp dir if a Downloads folder cannot be located.
fn ensure_storage_dir() -> Result<String, String> {
    let base = dirs::download_dir().unwrap_or_else(std::env::temp_dir);
    let dir: PathBuf = base.join("QuickShare");
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("Failed to create QuickShare folder: {e}"))?;
    Ok(dir.to_string_lossy().to_string())
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
        .map_err(|e| format!("Failed to bind QuickShare server: {e}"))
}

/// Stop sharing: disconnect all clients and trigger the server's graceful
/// shutdown. Safe to call when not running (no-op).
pub async fn stop_server(manager: QuickShareManager) {
    let (shutdown, closes) = manager.take_for_stop();
    for close in closes {
        let _ = close.send(true);
    }
    if let Some(tx) = shutdown {
        let _ = tx.send(());
        log::info!("[quickshare] sharing stopped");
    }
}
