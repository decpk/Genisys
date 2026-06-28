use super::Database;

pub fn load_app_data_db(_db: &Database) -> Option<serde_json::Value> {
    let path = crate::helpers::get_data_dir().join("app-data.json");
    if path.exists() {
        std::fs::read_to_string(&path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
    } else {
        None
    }
}
