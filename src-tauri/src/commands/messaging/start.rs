use tauri::State;

use crate::messaging::{MessagingManager, MsgIdentity};

#[tauri::command]
pub async fn cmd_msg_start(
    app: tauri::AppHandle,
    manager: State<'_, MessagingManager>,
) -> Result<MsgIdentity, String> {
    manager.start(app).await
}
