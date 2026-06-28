use tauri::State;

use crate::messaging::{MessagingManager, MsgIdentity};

#[tauri::command]
pub async fn cmd_msg_set_offline(
    app: tauri::AppHandle,
    manager: State<'_, MessagingManager>,
    offline: bool,
) -> Result<MsgIdentity, String> {
    manager.set_offline(app, offline).await
}
