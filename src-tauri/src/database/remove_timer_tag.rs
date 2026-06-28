use rusqlite::params;

use super::Database;

pub fn remove_timer_tag_db(db: &Database, id: &str) -> Result<(), String> {
    let conn = db.conn();
    conn.execute("DELETE FROM timer_tags WHERE id = ?1", params![id])
        .map_err(|e| format!("remove_timer_tag: {e}"))?;
    Ok(())
}
