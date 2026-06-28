use serde_json::Value;

/// Write raw bytes to a file at the given path.
/// Used for exporting generated content (PDFs, etc.) to user-chosen locations.
#[tauri::command]
pub fn cmd_write_binary_file(path: String, data: Vec<u8>) -> Value {
    match std::fs::write(&path, &data) {
        Ok(()) => serde_json::json!({ "success": true }),
        Err(e) => serde_json::json!({ "success": false, "error": e.to_string() }),
    }
}
