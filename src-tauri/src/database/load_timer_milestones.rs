use serde_json::{json, Value};

use super::Database;

pub fn load_timer_milestones_db(db: &Database) -> Vec<Value> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, key, achieved_at FROM timer_milestones ORDER BY achieved_at ASC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_timer_milestones prepare: {e}");
            return vec![];
        }
    };

    stmt.query_map([], |row| {
        Ok(json!({
            "id": row.get::<_, String>(0)?,
            "key": row.get::<_, String>(1)?,
            "achievedAt": row.get::<_, String>(2)?,
        }))
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
