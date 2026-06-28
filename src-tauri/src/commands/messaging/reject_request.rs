use tauri::State;

use crate::messaging::MessagingManager;

/// Reject an inbound chat request from `peer_id`, closing the parked session.
#[tauri::command]
pub async fn cmd_msg_reject_request(
    manager: State<'_, MessagingManager>,
    peer_id: String,
) -> Result<(), String> {
    manager.respond_request(peer_id, false)
}
