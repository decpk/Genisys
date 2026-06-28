use serde_json::{json, Value};

#[tauri::command]
pub fn cmd_mock_suggest_port(preferred: u16) -> Value {
    for offset in 1..=100u16 {
        let candidate = preferred.wrapping_add(offset);
        if candidate == 0 {
            continue;
        }
        if std::net::TcpListener::bind(format!("127.0.0.1:{}", candidate)).is_ok() {
            return json!({"success": true, "port": candidate});
        }
    }
    json!({"success": false, "error": "No available port found in range"})
}
