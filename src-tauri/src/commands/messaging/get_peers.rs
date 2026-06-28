use tauri::State;

use crate::messaging::{MessagingManager, MsgPeer};

#[tauri::command]
pub async fn cmd_msg_get_peers(
    manager: State<'_, MessagingManager>,
) -> Result<Vec<MsgPeer>, String> {
    Ok(manager.get_peers())
}
