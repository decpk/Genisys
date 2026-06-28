use rusqlite::params;

use super::Database;

pub fn remove_pm_prompt_db(db: &Database, prompt_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute("DELETE FROM pm_prompts WHERE id = ?1", params![prompt_id]) {
        eprintln!("[db] remove_pm_prompt: {e}");
    }
}
