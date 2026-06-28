use rusqlite::params;
use super::Database;
use crate::types::*;

pub fn save_note_notebook_db(db: &Database, notebook: &NoteNotebook) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO note_notebooks (id, name, color, icon, emoji, is_system, sort_order, project_id, sort_preference, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)",
        params![
            notebook.id, notebook.name, notebook.color, notebook.icon, notebook.emoji,
            notebook.is_system as i64, notebook.sort_order, notebook.project_id,
            notebook.sort_preference, notebook.created_at, notebook.updated_at
        ],
    ) {
        eprintln!("[db] save_note_notebook: {e}");
    }
}
