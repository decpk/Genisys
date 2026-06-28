use rusqlite::params;

use super::Database;
use crate::types::Chapter;

pub fn save_chapter_db(db: &Database, chapter: &Chapter) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO chapters (id, book_id, chapter_number, title, content, status, sort_order, is_read, language, generation_duration_ms, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12)
         ON CONFLICT(id) DO UPDATE SET
            book_id = excluded.book_id,
            chapter_number = excluded.chapter_number,
            title = excluded.title,
            content = excluded.content,
            status = excluded.status,
            sort_order = excluded.sort_order,
            is_read = excluded.is_read,
            language = excluded.language,
            generation_duration_ms = excluded.generation_duration_ms,
            updated_at = excluded.updated_at",
        params![
            chapter.id,
            chapter.book_id,
            chapter.chapter_number,
            chapter.title,
            chapter.content,
            chapter.status,
            chapter.sort_order,
            chapter.is_read,
            chapter.language,
            chapter.generation_duration_ms,
            chapter.created_at,
            chapter.updated_at
        ],
    ) {
        eprintln!("[db] save_chapter: {e}");
    }

    // Update book's chapter_count and updated_at
    if let Err(e) = conn.execute(
        "UPDATE books SET
            chapter_count = (SELECT COUNT(*) FROM chapters WHERE book_id = ?1),
            updated_at = ?2
         WHERE id = ?1",
        params![chapter.book_id, chapter.updated_at],
    ) {
        eprintln!("[db] update_book_chapter_count: {e}");
    }
}
