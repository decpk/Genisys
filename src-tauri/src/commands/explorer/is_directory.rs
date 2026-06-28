use serde_json::Value;
use std::path::Path;

#[tauri::command]
pub async fn cmd_is_directory(path: String) -> Value {
    let is_dir = Path::new(&path).is_dir();
    serde_json::json!({ "isDirectory": is_dir })
}
