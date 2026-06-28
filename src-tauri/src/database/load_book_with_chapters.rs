use super::Database;
use crate::types::{BookMeta, BookWithChapters, Chapter};

pub fn load_book_with_chapters_db(db: &Database, book_id: &str) -> Option<BookWithChapters> {
    let conn = db.reader();

    // Load book metadata
    let book = match conn.query_row(
        "SELECT id, title, description, status, chapter_count, model, language, generation_duration_ms, created_at, updated_at
         FROM books WHERE id = ?1",
        rusqlite::params![book_id],
        |row| {
            Ok(BookMeta {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                status: row.get(3)?,
                chapter_count: row.get(4)?,
                model: row.get(5)?,
                language: row.get(6)?,
                generation_duration_ms: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        },
    ) {
        Ok(b) => b,
        Err(_) => return None,
    };

    // Load chapters ordered by sort_order (content excluded for performance)
    let mut stmt = match conn.prepare(
        "SELECT id, book_id, chapter_number, title, '' AS content, status, sort_order, is_read, language, generation_duration_ms, created_at, updated_at
         FROM chapters WHERE book_id = ?1 ORDER BY sort_order ASC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_book_chapters: {e}");
            return Some(BookWithChapters { book, chapters: vec![] });
        }
    };

    let chapters = stmt
        .query_map(rusqlite::params![book_id], |row| {
            Ok(Chapter {
                id: row.get(0)?,
                book_id: row.get(1)?,
                chapter_number: row.get(2)?,
                title: row.get(3)?,
                content: row.get(4)?,
                status: row.get(5)?,
                sort_order: row.get(6)?,
                is_read: row.get::<_, i64>(7).map(|v| v != 0).unwrap_or(false),
                language: row.get(8)?,
                generation_duration_ms: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default();

    Some(BookWithChapters { book, chapters })
}
