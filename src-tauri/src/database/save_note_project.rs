use rusqlite::params;
use super::Database;
use crate::types::*;

pub fn save_note_project_db(db: &Database, project: &NoteProject) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO note_projects (id, name, color, icon, emoji, is_system, is_favorite, sort_order, sort_preference, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)",
        params![
            project.id, project.name, project.color, project.icon, project.emoji,
            project.is_system as i64, project.is_favorite as i64, project.sort_order,
            project.sort_preference, project.created_at, project.updated_at
        ],
    ) {
        eprintln!("[db] save_note_project: {e}");
    }
}
