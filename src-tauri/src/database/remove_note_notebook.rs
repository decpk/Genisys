use rusqlite::params;
use super::Database;

pub fn remove_note_notebook_db(db: &Database, notebook_id: &str) {
    let conn = db.conn();
    // Set notes' notebook_id to NULL before deleting (ON DELETE SET NULL handles this via FK,
    // but we also need to clear section_id and topic_id for orphaned notes)
    let _ = conn.execute(
        "UPDATE notes SET section_id = NULL, topic_id = NULL WHERE notebook_id = ?1",
        params![notebook_id],
    );
    if let Err(e) = conn.execute("DELETE FROM note_notebooks WHERE id=?1", params![notebook_id]) {
        eprintln!("[db] remove_note_notebook: {e}");
    }
}
