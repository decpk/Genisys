use serde_json::{json, Value};
use tauri::{AppHandle, State};

use crate::commands::AppState;

use super::bundle::build_notes_bundle;
use super::send::send_bundle;
use super::state::ContentShareManager;
use super::types::ShareOffer;

/// Share a notes selection with a discovered device. `kind` is one of
/// `note` | `topic` | `section` | `notebook` | `project` | `all`; `id` is the
/// root id for every kind except `all`.
#[tauri::command]
pub async fn cmd_content_share_send_notes(
    app: AppHandle,
    manager: State<'_, ContentShareManager>,
    state: State<'_, AppState>,
    device_id: String,
    kind: String,
    id: Option<String>,
) -> Result<Value, String> {
    let peer = manager
        .peer(&device_id)
        .ok_or_else(|| "That device is no longer on the network".to_string())?;

    let db = state.db.clone();
    let (manifest, zip_bytes) =
        tokio::task::spawn_blocking(move || build_notes_bundle(&db, &kind, id.as_deref()))
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
