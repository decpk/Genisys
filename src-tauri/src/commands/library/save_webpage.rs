use crate::commands::AppState;
use crate::database::save_webpage_db;
use crate::types::SavedWebpage;
use serde_json::Value;
use tauri::{AppHandle, Manager, State};
use uuid::Uuid;

use super::mhtml::build_mhtml;

#[tauri::command]
pub async fn cmd_save_webpage(
    app: AppHandle,
    state: State<'_, AppState>,
    url: String,
    name: String,
    created_at: String,
) -> Result<Value, String> {
    let id = Uuid::new_v4().to_string();
    let file_name = format!("{id}.mhtml");

    // Resolve saved-webpages directory inside app data dir
    let webpages_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Cannot resolve app data dir: {e}"))?
        .join("saved-webpages");

    std::fs::create_dir_all(&webpages_dir)
        .map_err(|e| format!("Cannot create saved-webpages dir: {e}"))?;

    let file_path = webpages_dir.join(&file_name);
    let url_clone = url.clone();

    // Build MHTML in a blocking task
    let (title, mhtml_bytes) =
        tokio::task::spawn_blocking(move || build_mhtml(&url_clone))
            .await
            .map_err(|e| format!("Task join error: {e}"))??;

    let file_size = mhtml_bytes.len() as i64;

    // Write MHTML to disk
    std::fs::write(&file_path, &mhtml_bytes)
        .map_err(|e| format!("Failed to write MHTML file: {e}"))?;

    let final_name = if name.is_empty() { title.clone() } else { name };

    let webpage = SavedWebpage {
        id: id.clone(),
        name: final_name.clone(),
        url: url.clone(),
        file_path: file_name,
        file_size,
        created_at: created_at.clone(),
        updated_at: created_at,
    };

    save_webpage_db(&state.db, &webpage);

    Ok(serde_json::json!({
        "success": true,
        "webpage": webpage
    }))
}
