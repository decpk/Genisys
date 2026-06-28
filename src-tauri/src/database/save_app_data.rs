use super::Database;

pub fn save_app_data_db(_db: &Database, data: &serde_json::Value) {
    let dir = crate::helpers::get_data_dir();
    let path = dir.join("app-data.json");
    let tmp = dir.join("app-data.tmp.json");
    let json = serde_json::to_string_pretty(data).unwrap_or_default();
    if std::fs::create_dir_all(&dir).is_ok() {
        if std::fs::write(&tmp, &json).is_ok() {
            if let Err(e) = std::fs::rename(&tmp, &path) {
                eprintln!("[db] save_app_data rename: {e}");
                // Fallback: direct write
                std::fs::write(&path, &json).ok();
            }
        }
    }
}
