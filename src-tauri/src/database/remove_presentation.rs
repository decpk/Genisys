use rusqlite::params;

use super::Database;

pub fn remove_presentation_db(db: &Database, presentation_id: &str) {
    let conn = db.conn();
    // Slides cascade-delete via the foreign key.
    if let Err(e) = conn.execute(
        "DELETE FROM presentations WHERE id = ?1",
        params![presentation_id],
    ) {
        eprintln!("[db] remove_presentation: {e}");
    }
}
