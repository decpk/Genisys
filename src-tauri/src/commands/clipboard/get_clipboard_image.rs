use base64::Engine;
use serde_json::Value;
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn cmd_get_clipboard_image(
    app: AppHandle,
    image_path: String,
) -> Value {
    let data_dir = match app.path().app_data_dir() {
        Ok(dir) => dir,
        Err(e) => return serde_json::json!({ "success": false, "error": e.to_string() }),
    };

    let full_path = data_dir.join("clipboard-images").join(&image_path);

    match std::fs::read(&full_path) {
        Ok(bytes) => {
            let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
            let data_url = format!("data:image/png;base64,{}", b64);
            serde_json::json!({ "success": true, "dataUrl": data_url })
        }
        Err(e) => serde_json::json!({ "success": false, "error": e.to_string() }),
    }
}
