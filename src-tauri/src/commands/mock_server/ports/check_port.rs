use serde_json::{json, Value};

#[tauri::command]
pub fn cmd_mock_check_port(port: u16) -> Value {
    match std::net::TcpListener::bind(format!("127.0.0.1:{}", port)) {
        Ok(_) => json!({"available": true}),
        Err(e) => json!({"available": false, "error": e.to_string()}),
    }
}
