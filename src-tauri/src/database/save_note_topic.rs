use rusqlite::params;
use super::Database;
use crate::types::*;

pub fn save_note_topic_db(db: &Database, topic: &NoteTopic) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO note_topics (id, section_id, name, color, icon, emoji, sort_order, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",
        params![
            topic.id, topic.section_id, topic.name, topic.color,
            topic.icon, topic.emoji, topic.sort_order, topic.created_at, topic.updated_at
        ],
    ) {
        eprintln!("[db] save_note_topic: {e}");
    }
}
