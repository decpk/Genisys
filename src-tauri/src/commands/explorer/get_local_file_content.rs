use crate::commands::err_val;
use serde_json::Value;
use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub async fn cmd_get_local_file_content(root_path: String, file_path: String) -> Value {
    let full = PathBuf::from(&root_path).join(file_path.trim_start_matches('/'));
    match fs::metadata(&full) {
        Ok(meta) if meta.len() > 2 * 1024 * 1024 => err_val("File is too large (>2MB)"),
        Ok(_) => match fs::read_to_string(&full) {
            Ok(content) => serde_json::json!({"success": true, "data": content}),
            Err(e) => err_val(e),
        },
        Err(e) => err_val(e),
    }
}
