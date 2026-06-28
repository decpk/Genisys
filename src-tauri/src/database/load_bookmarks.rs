use rusqlite::params;

use super::Database;
use crate::types::BookmarkWithContext;

pub fn load_bookmarks_db(db: &Database) -> Vec<BookmarkWithContext> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT bm.id, bm.book_id, bm.chapter_id, bm.highlight_id, bm.label, bm.note, bm.created_at,
                b.title AS book_title, c.title AS chapter_title, c.chapter_number
         FROM bookmarks bm
         JOIN books b ON b.id = bm.book_id
         JOIN chapters c ON c.id = bm.chapter_id
         ORDER BY bm.created_at DESC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_bookmarks: {e}");
            return vec![];
        }
    };
    stmt.query_map([], |row| {
        Ok(BookmarkWithContext {
            id: row.get(0)?,
            book_id: row.get(1)?,
            chapter_id: row.get(2)?,
            highlight_id: row.get(3)?,
            label: row.get(4)?,
            note: row.get(5)?,
            created_at: row.get(6)?,
            book_title: row.get(7)?,
            chapter_title: row.get(8)?,
            chapter_number: row.get(9)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}

pub fn load_bookmarks_for_chapter_db(db: &Database, chapter_id: &str) -> Vec<BookmarkWithContext> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT bm.id, bm.book_id, bm.chapter_id, bm.highlight_id, bm.label, bm.note, bm.created_at,
                b.title AS book_title, c.title AS chapter_title, c.chapter_number
         FROM bookmarks bm
         JOIN books b ON b.id = bm.book_id
         JOIN chapters c ON c.id = bm.chapter_id
         WHERE bm.chapter_id = ?1
         ORDER BY bm.created_at ASC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_bookmarks_for_chapter: {e}");
            return vec![];
        }
    };
    stmt.query_map(params![chapter_id], |row| {
        Ok(BookmarkWithContext {
            id: row.get(0)?,
            book_id: row.get(1)?,
            chapter_id: row.get(2)?,
            highlight_id: row.get(3)?,
            label: row.get(4)?,
            note: row.get(5)?,
            created_at: row.get(6)?,
            book_title: row.get(7)?,
            chapter_title: row.get(8)?,
            chapter_number: row.get(9)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
