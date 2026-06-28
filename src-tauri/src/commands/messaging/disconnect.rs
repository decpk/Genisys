use tauri::State;

use crate::messaging::MessagingManager;

#[tauri::command]
pub async fn cmd_msg_disconnect(
    app: tauri::AppHandle,
    manager: State<'_, MessagingManager>,
    peer_id: String,
) -> Result<(), String> {
    manager.disconnect(app, peer_id)
}
