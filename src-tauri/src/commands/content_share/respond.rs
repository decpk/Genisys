use serde_json::{json, Value};
use tauri::State;

use super::state::ContentShareManager;

/// Resolve a pending incoming transfer: the receiver's Accept/Decline decision
/// for the offer identified by `transfer_id`. Unblocks the waiting offer handler.
#[tauri::command]
pub async fn cmd_content_share_respond(
    manager: State<'_, ContentShareManager>,
    transfer_id: String,
    accept: bool,
) -> Result<Value, String> {
    let found = manager.resolve_pending(&transfer_id, accept);
    Ok(json!({ "success": true, "data": { "found": found } }))
}
