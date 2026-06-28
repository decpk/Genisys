use serde_json::{json, Value};
use tauri::{AppHandle, State};

use crate::commands::AppState;

use super::bundle::build_library_bundle;
use super::send::send_bundle;
use super::state::ContentShareManager;
use super::types::ShareOffer;

/// Share a whole book with a discovered device. Assembles the bundle, sends the
/// offer (which waits for the receiver's approval), and uploads on accept.
#[tauri::command]
pub async fn cmd_content_share_send_book(
    app: AppHandle,
    manager: State<'_, ContentShareManager>,
    state: State<'_, AppState>,
    device_id: String,
    book_id: String,
) -> Result<Value, String> {
    let peer = manager
        .peer(&device_id)
        .ok_or_else(|| "That device is no longer on the network".to_string())?;

    let db = state.db.clone();
    let (manifest, zip_bytes) =
        tokio::task::spawn_blocking(move || build_library_bundle(&db, &book_id))
            .await
            .map_err(|e| format!("failed to build bundle: {e}"))??;

    let offer = ShareOffer {
        sender_device_id: manager.device_id(),
        sender_device_name: manager.device_name(),
        manifest,
    };

    match send_bundle(&app, &peer, &offer, zip_bytes, &device_id).await {
        Ok(outcome) => Ok(json!({ "success": true, "accepted": outcome.accepted })),
        Err(error) => Ok(json!({ "success": false, "error": error })),
    }
}
