use tauri::State;

use crate::messaging::MessagingManager;

#[tauri::command]
pub async fn cmd_msg_send_signal(
    manager: State<'_, MessagingManager>,
    peer_id: String,
    payload: String,
) -> Result<(), String> {
    manager.send_signal(peer_id, payload)
}
