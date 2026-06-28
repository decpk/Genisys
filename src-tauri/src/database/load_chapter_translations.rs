use super::Database;
use crate::types::ChapterTranslation;

/// Load translation metadata for a chapter (content excluded for performance).
pub fn load_chapter_translations_db(db: &Database, chapter_id: &str) -> Vec<ChapterTranslation> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, chapter_id, language, '' AS content, status, created_at, updated_at
         FROM chapter_translations WHERE chapter_id = ?1 ORDER BY language ASC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_chapter_translations: {e}");
            return vec![];
        }
    };
    stmt.query_map(rusqlite::params![chapter_id], |row| {
        Ok(ChapterTranslation {
            id: row.get(0)?,
            chapter_id: row.get(1)?,
            language: row.get(2)?,
            content: row.get(3)?,
            status: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
