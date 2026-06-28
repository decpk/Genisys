use rusqlite::params;
use super::Database;
use crate::types::ClipboardLabel;

pub fn load_labels_for_clipboard_item_db(db: &Database, item_id: &str) -> Vec<ClipboardLabel> {
    let conn = db.reader();

    let mut stmt = match conn.prepare(
        "SELECT l.id, l.name, l.color, l.created_at
         FROM clipboard_labels l
         INNER JOIN clipboard_item_labels il ON il.label_id = l.id
         WHERE il.item_id = ?1
         ORDER BY l.created_at ASC"
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_labels_for_clipboard_item prepare: {e}");
            return vec![];
        }
    };

    stmt.query_map(params![item_id], |row| {
        Ok(ClipboardLabel {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            created_at: row.get(3)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
