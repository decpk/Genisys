use super::Database;

pub fn clear_usage_data_db(db: &Database) -> Result<(), String> {
    let conn = db.conn();
    conn.execute("DELETE FROM app_usage_sessions", [])
        .map_err(|e| format!("clear_usage_data: {e}"))?;
    Ok(())
}
