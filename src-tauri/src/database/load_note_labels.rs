use super::Database;
use crate::types::*;

pub fn load_note_labels_db(db: &Database) -> Vec<NoteLabel> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, name, color, created_at FROM note_labels ORDER BY name ASC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_note_labels prepare: {e}");
            return vec![];
        }
    };
    stmt.query_map([], |row| {
        Ok(NoteLabel {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            created_at: row.get(3)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
