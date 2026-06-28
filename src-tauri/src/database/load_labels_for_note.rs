use rusqlite::{params, Connection};
use super::Database;

pub fn load_labels_for_note_db(db: &Database, note_id: &str) -> Vec<String> {
    let conn = db.reader();
    load_labels_for_note_with_conn(&conn, note_id)
}

pub fn load_labels_for_note_with_conn(conn: &Connection, note_id: &str) -> Vec<String> {
    let mut stmt = match conn.prepare(
        "SELECT label_id FROM note_label_map WHERE note_id=?1",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_labels_for_note prepare: {e}");
            return vec![];
        }
    };
    stmt.query_map(params![note_id], |row| row.get(0))
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default()
}
