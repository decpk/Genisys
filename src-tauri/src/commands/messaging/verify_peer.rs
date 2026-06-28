use tauri::State;

use crate::messaging::{MessagingManager, MsgPeer};

#[tauri::command]
pub async fn cmd_msg_verify_peer(
    app: tauri::AppHandle,
    manager: State<'_, MessagingManager>,
    peer_id: String,
) -> Result<MsgPeer, String> {
    manager.verify_peer(app, peer_id)
}
