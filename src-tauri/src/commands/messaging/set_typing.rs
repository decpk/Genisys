use tauri::State;

use crate::messaging::MessagingManager;

#[tauri::command]
pub async fn cmd_msg_set_typing(
    manager: State<'_, MessagingManager>,
    peer_id: String,
    is_typing: bool,
) -> Result<(), String> {
    manager.set_typing(peer_id, is_typing)
}
