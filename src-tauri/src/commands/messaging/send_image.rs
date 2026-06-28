use tauri::State;

use crate::messaging::{MessagingManager, MsgEnvelope};

#[tauri::command]
pub async fn cmd_msg_send_image(
    manager: State<'_, MessagingManager>,
    peer_id: String,
    data_base64: String,
    mime_type: String,
    file_name: Option<String>,
) -> Result<MsgEnvelope, String> {
    manager.send_image(peer_id, data_base64, mime_type, file_name)
}
