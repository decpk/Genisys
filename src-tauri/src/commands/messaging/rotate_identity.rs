use tauri::State;

use crate::messaging::{MessagingManager, MsgIdentity};

/// Rotate this device's identity: new keypair (new fingerprint/unique id) and
/// a fresh listener port, so the previous address can no longer be used.
#[tauri::command]
pub async fn cmd_msg_rotate_identity(
    app: tauri::AppHandle,
    manager: State<'_, MessagingManager>,
) -> Result<MsgIdentity, String> {
    manager.rotate(app).await
}
