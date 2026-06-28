use rusqlite::params;

use super::Database;
use crate::types::ChapterTranslation;

pub fn save_chapter_translation_db(db: &Database, translation: &ChapterTranslation) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO chapter_translations (id, chapter_id, language, content, status, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7)
         ON CONFLICT(chapter_id, language) DO UPDATE SET
            content = excluded.content,
            status = excluded.status,
            updated_at = excluded.updated_at",
        params![
            translation.id,
            translation.chapter_id,
            translation.language,
            translation.content,
            translation.status,
            translation.created_at,
            translation.updated_at
        ],
    ) {
        eprintln!("[db] save_chapter_translation: {e}");
    }
}
