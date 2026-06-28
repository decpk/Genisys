use rusqlite::params;

use super::Database;

pub fn remove_previewer_preview_db(db: &Database, preview_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM weblinks_previews WHERE id = ?1",
        params![preview_id],
    ) { eprintln!("[db] remove_previewer_preview: {e}"); }
}
