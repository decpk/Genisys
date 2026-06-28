use tauri::State;

use crate::messaging::{MessagingManager, MsgPeer};

#[tauri::command]
pub async fn cmd_msg_connect(
    app: tauri::AppHandle,
    manager: State<'_, MessagingManager>,
    peer_id: Option<String>,
    host: Option<String>,
    port: Option<u16>,
) -> Result<MsgPeer, String> {
    manager.connect(app, peer_id, host, port).await
}
