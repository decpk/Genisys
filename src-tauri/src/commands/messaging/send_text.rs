use tauri::State;

use crate::messaging::{MessagingManager, MsgEnvelope};

#[tauri::command]
pub async fn cmd_msg_send_text(
    manager: State<'_, MessagingManager>,
    peer_id: String,
    text: String,
) -> Result<MsgEnvelope, String> {
    manager.send_text(peer_id, text)
}
