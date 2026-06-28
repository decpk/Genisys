use rusqlite::params;

use super::Database;

/// INSERT OR IGNORE a milestone keyed by `key`. Returns the id (existing or newly created).
pub fn save_timer_milestone_db(db: &Database, key: &str) -> Result<String, String> {
    let conn = db.conn();

    if let Ok(existing) = conn.query_row(
        "SELECT id FROM timer_milestones WHERE key = ?1",
        params![key],
        |row| row.get::<_, String>(0),
    ) {
        return Ok(existing);
    }

    let id = format!("ms_{}", uuid::Uuid::new_v4());
    let achieved_at = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT OR IGNORE INTO timer_milestones (id, key, achieved_at) VALUES (?1, ?2, ?3)",
        params![id, key, achieved_at],
    )
    .map_err(|e| format!("save_timer_milestone: {e}"))?;

    // Re-fetch in case INSERT was ignored due to a race.
    let final_id: String = conn
        .query_row(
            "SELECT id FROM timer_milestones WHERE key = ?1",
            params![key],
            |row| row.get(0),
        )
        .map_err(|e| format!("save_timer_milestone fetch: {e}"))?;

    Ok(final_id)
}
