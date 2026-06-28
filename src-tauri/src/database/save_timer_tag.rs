use rusqlite::params;
use serde_json::Value;

use super::Database;

pub fn save_timer_tag_db(db: &Database, tag: &Value) -> Result<String, String> {
    let conn = db.conn();

    let id = tag
        .get("id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| "Missing field: id".to_string())?
        .to_string();
    let name = tag
        .get("name")
        .and_then(|v| v.as_str())
        .ok_or_else(|| "Missing field: name".to_string())?
        .to_string();
    let color = tag
        .get("color")
        .and_then(|v| v.as_str())
        .ok_or_else(|| "Missing field: color".to_string())?
        .to_string();
    let created_at = match tag.get("createdAt") {
        Some(Value::String(s)) => s.clone(),
        Some(Value::Number(n)) => n.to_string(),
        _ => return Err("Missing field: createdAt".to_string()),
    };

    conn.execute(
        "INSERT OR REPLACE INTO timer_tags (id, name, color, created_at)
         VALUES (?1, ?2, ?3, ?4)",
        params![id, name, color, created_at],
    )
    .map_err(|e| format!("save_timer_tag: {e}"))?;

    Ok(id)
}
