use tauri::State;

use crate::messaging::MessagingManager;

#[tauri::command]
pub async fn cmd_msg_send_control(
    manager: State<'_, MessagingManager>,
    peer_id: String,
    payload: String,
) -> Result<(), String> {
    manager.send_control(peer_id, payload)
}
