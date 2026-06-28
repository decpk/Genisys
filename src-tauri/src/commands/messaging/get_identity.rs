use tauri::State;

use crate::messaging::{MessagingManager, MsgIdentity};

#[tauri::command]
pub async fn cmd_msg_get_identity(
    manager: State<'_, MessagingManager>,
) -> Result<MsgIdentity, String> {
    manager.get_identity()
}
