use tauri::State;

use crate::messaging::{MessagingManager, MsgIdentity};

#[tauri::command]
pub async fn cmd_msg_set_display_name(
    manager: State<'_, MessagingManager>,
    name: String,
) -> Result<MsgIdentity, String> {
    manager.set_display_name(name)
}
