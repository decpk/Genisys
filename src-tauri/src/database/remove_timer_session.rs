use rusqlite::params;

use super::Database;

pub fn remove_timer_session_db(db: &Database, id: &str) -> Result<(), String> {
    let conn = db.conn();
    conn.execute("DELETE FROM timer_sessions WHERE id = ?1", params![id])
        .map_err(|e| format!("remove_timer_session: {e}"))?;
    Ok(())
}
