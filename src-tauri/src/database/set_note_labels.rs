use rusqlite::{params, Connection};
use super::Database;

pub fn set_note_labels_db(db: &Database, note_id: &str, label_ids: &[String]) {
    let conn = db.conn();
    set_note_labels_with_conn(&conn, note_id, label_ids);
}

pub fn set_note_labels_with_conn(conn: &Connection, note_id: &str, label_ids: &[String]) {
    // Remove all existing labels for this note
    let _ = conn.execute("DELETE FROM note_label_map WHERE note_id=?1", params![note_id]);
    // Insert new label mappings
    for label_id in label_ids {
        let _ = conn.execute(
            "INSERT OR IGNORE INTO note_label_map (note_id, label_id) VALUES (?1, ?2)",
            params![note_id, label_id],
        );
    }
}
