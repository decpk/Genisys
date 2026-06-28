use tauri::State;

use crate::messaging::{MessagingManager, MsgIdentity};

/// Re-trigger LAN peer discovery without rotating identity: recreate the mDNS
/// daemon and re-advertise/browse under the same identity and port.
#[tauri::command]
pub async fn cmd_msg_rescan(
    app: tauri::AppHandle,
    manager: State<'_, MessagingManager>,
) -> Result<MsgIdentity, String> {
    manager.rescan(app).await
}
