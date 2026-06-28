use super::Database;
use crate::types::*;

pub fn load_note_notebooks_db(db: &Database) -> Vec<NoteNotebook> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, name, color, icon, emoji, is_system, sort_order, project_id, created_at, updated_at, sort_preference
         FROM note_notebooks ORDER BY sort_order ASC, created_at ASC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_note_notebooks prepare: {e}");
            return vec![];
        }
    };
    stmt.query_map([], |row| {
        let is_system: i64 = row.get(5)?;
        Ok(NoteNotebook {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            icon: row.get(3)?,
            emoji: row.get(4)?,
            is_system: is_system != 0,
            sort_order: row.get(6)?,
            project_id: row.get(7)?,
            sort_preference: row.get(10)?,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
