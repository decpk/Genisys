use tauri::State;

use crate::messaging::MessagingManager;

/// Accept an inbound chat request from `peer_id`, letting the parked session
/// proceed to the connected state.
#[tauri::command]
pub async fn cmd_msg_accept_request(
    manager: State<'_, MessagingManager>,
    peer_id: String,
) -> Result<(), String> {
    manager.respond_request(peer_id, true)
}
