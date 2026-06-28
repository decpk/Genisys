use rusqlite::params;
use super::Database;
use crate::types::*;

pub fn save_note_section_db(db: &Database, section: &NoteSection) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO note_sections (id, notebook_id, name, color, icon, emoji, sort_order, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",
        params![
            section.id, section.notebook_id, section.name, section.color,
            section.icon, section.emoji, section.sort_order, section.created_at, section.updated_at
        ],
    ) {
        eprintln!("[db] save_note_section: {e}");
    }
}
