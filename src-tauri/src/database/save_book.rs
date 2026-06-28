use rusqlite::params;

use super::Database;
use crate::types::Book;

pub fn save_book_db(db: &Database, book: &Book) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO books (id, title, description, status, chapter_count, model, language, generation_duration_ms, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)
         ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            status = excluded.status,
            chapter_count = excluded.chapter_count,
            model = excluded.model,
            language = excluded.language,
            generation_duration_ms = excluded.generation_duration_ms,
            updated_at = excluded.updated_at",
        params![
            book.id,
            book.title,
            book.description,
            book.status,
            book.chapter_count,
            book.model,
            book.language,
            book.generation_duration_ms,
            book.created_at,
            book.updated_at
        ],
    ) {
        eprintln!("[db] save_book: {e}");
    }
}
