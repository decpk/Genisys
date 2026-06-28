use rusqlite::params;
use serde_json::Value;

use super::Database;

// ─── Sources (Chat-attached sources persisted in `research_sources` table) ───

pub fn load_research_sources_db(db: &Database, session_id: &str) -> Vec<Value> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, session_id, source_type, path, name, created_at
         FROM research_sources WHERE session_id = ?1 ORDER BY created_at ASC",
    ) {
        Ok(s) => s,
        Err(e) => { eprintln!("[db] load_research_sources prepare: {e}"); return vec![]; }
    };
    stmt.query_map(params![session_id], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "sessionId": row.get::<_, String>(1)?,
            "sourceType": row.get::<_, String>(2)?,
            "path": row.get::<_, Option<String>>(3)?,
            "name": row.get::<_, String>(4)?,
            "createdAt": row.get::<_, String>(5)?,
        }))
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}

pub fn save_research_source_db(db: &Database, source: &Value) -> Result<(), String> {
    let conn = db.conn();
    conn.execute(
        "INSERT INTO research_sources (id, session_id, source_type, path, name, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            source["id"].as_str().unwrap_or(""),
            source["sessionId"].as_str().unwrap_or(""),
            source["sourceType"].as_str().unwrap_or(""),
            source["path"].as_str(),
            source["name"].as_str().unwrap_or(""),
            source["createdAt"].as_str().unwrap_or(""),
        ],
    ).map_err(|e| format!("insert source: {e}"))?;
    Ok(())
}

pub fn remove_research_source_db(db: &Database, source_id: &str) -> Result<(), String> {
    let conn = db.conn();
    conn.execute(
        "DELETE FROM research_sources WHERE id = ?1",
        params![source_id],
    ).map_err(|e| format!("delete source: {e}"))?;
    Ok(())
}
