use serde_json::{json, Value};

use super::state::registry;

#[tauri::command]
pub async fn cmd_fs_stop_watching(root_path: String) -> Value {
    let mut reg = registry().lock().expect("fs watcher registry poisoned");
    reg.remove(&root_path);
    json!({ "success": true, "data": { "status": "stopped" } })
}
