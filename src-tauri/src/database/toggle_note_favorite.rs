use rusqlite::params;

use super::Database;

pub fn toggle_note_favorite_db(db: &Database, note_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "UPDATE notes SET is_favorite = CASE WHEN is_favorite = 0 THEN 1 ELSE 0 END, updated_at = ?2 WHERE id = ?1",
        params![note_id, chrono::Utc::now().to_rfc3339()],
    ) {
        eprintln!("[db] toggle_note_favorite: {e}");
    }
}
