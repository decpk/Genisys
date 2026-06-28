use serde_json::{json, Value};

use super::Database;

pub fn load_timer_goals_db(db: &Database) -> Vec<Value> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, goal_type, target_value, period_start, period_end, achieved_at
         FROM timer_goals ORDER BY period_start DESC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_timer_goals prepare: {e}");
            return vec![];
        }
    };

    stmt.query_map([], |row| {
        Ok(json!({
            "id": row.get::<_, String>(0)?,
            "goalType": row.get::<_, String>(1)?,
            "targetValue": row.get::<_, i64>(2)?,
            "periodStart": row.get::<_, String>(3)?,
            "periodEnd": row.get::<_, String>(4)?,
            "achievedAt": row.get::<_, Option<String>>(5)?,
        }))
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
