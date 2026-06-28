use serde_json::{json, Value};

use super::Database;

pub fn load_timer_tags_db(db: &Database) -> Vec<Value> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, name, color, created_at FROM timer_tags ORDER BY created_at ASC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_timer_tags prepare: {e}");
            return vec![];
        }
    };

    stmt.query_map([], |row| {
        Ok(json!({
            "id": row.get::<_, String>(0)?,
            "name": row.get::<_, String>(1)?,
            "color": row.get::<_, String>(2)?,
            "createdAt": row.get::<_, String>(3)?,
        }))
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
