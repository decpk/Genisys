use crate::commands::AppState;
use serde_json::Value;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_clipboard_manager::ClipboardExt;

#[tauri::command]
pub fn cmd_copy_clipboard_item(
    app: AppHandle,
    state: State<'_, AppState>,
    id: String,
) -> Value {
    let result = {
        let conn = state.db.reader();
        conn.query_row(
            "SELECT content_type, text_content, image_path FROM clipboard_items WHERE id = ?1",
            rusqlite::params![&id],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, Option<String>>(1)?,
                    row.get::<_, Option<String>>(2)?,
                ))
            },
        )
    };

    match result {
        Ok((content_type, text_content, image_path)) => {
            if content_type == "text" {
                if let Some(text) = text_content {
                    match app.clipboard().write_text(text) {
                        Ok(_) => return serde_json::json!({ "success": true }),
                        Err(e) => return serde_json::json!({ "success": false, "error": e.to_string() }),
                    }
                }
            } else if content_type == "image" {
                if let Some(filename) = image_path {
                    if let Ok(data_dir) = app.path().app_data_dir() {
                        let full_path = data_dir.join("clipboard-images").join(&filename);
                        match std::fs::read(&full_path) {
                            Ok(bytes) => {
                                // Use clipboard-rs to write image since Tauri Image API doesn't support from_bytes directly
                                let clipboard_ctx = clipboard_rs::ClipboardContext::new();
                                match clipboard_ctx {
                                    Ok(ctx) => {
                                        use clipboard_rs::common::RustImage;
                                        match clipboard_rs::RustImageData::from_bytes(&bytes) {
                                            Ok(img) => {
                                                use clipboard_rs::Clipboard;
                                                match ctx.set_image(img) {
                                                    Ok(_) => return serde_json::json!({ "success": true }),
                                                    Err(e) => return serde_json::json!({ "success": false, "error": format!("{e}") }),
                                                }
                                            }
                                            Err(e) => return serde_json::json!({ "success": false, "error": format!("{e}") }),
                                        }
                                    }
                                    Err(e) => return serde_json::json!({ "success": false, "error": format!("{e}") }),
                                }
                            }
                            Err(e) => return serde_json::json!({ "success": false, "error": e.to_string() }),
                        }
                    }
                }
            }
            serde_json::json!({ "success": false, "error": "No content to copy" })
        }
        Err(e) => serde_json::json!({ "success": false, "error": e.to_string() }),
    }
}
