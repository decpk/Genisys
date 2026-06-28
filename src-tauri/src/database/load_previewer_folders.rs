use super::Database;
use crate::types::*;

pub fn load_previewer_folders_db(db: &Database) -> Vec<PreviewFolder> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, name, color, parent_id, sort_order, created_at
         FROM weblinks_folders ORDER BY sort_order ASC",
    ) { Ok(s) => s, Err(e) => { eprintln!("[db] load_previewer_folders prepare: {e}"); return vec![]; } };
    stmt.query_map([], |row| {
        Ok(PreviewFolder {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            parent_id: row.get::<_, Option<String>>(3)?,
            sort_order: row.get(4)?,
            created_at: row.get(5)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect()).unwrap_or_default()
}
