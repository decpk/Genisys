use serde_json::{json, Value};
use tauri::State;

use super::state::MonitorManager;

/// Relay a WebRTC signaling payload (offer / ICE candidate) from the desktop to
/// one specific connected viewer. The desktop owns the `RTCPeerConnection`; the
/// server just brokers the SDP/ICE as opaque JSON.
#[tauri::command]
pub async fn cmd_monitor_send_signal(
    manager: State<'_, MonitorManager>,
    client_id: String,
    data: Value,
) -> Result<Value, String> {
    let delivered = manager.send_to_client(&client_id, data);
    Ok(json!({ "success": delivered }))
}
