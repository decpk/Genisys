use rusqlite::params;

use super::Database;
use crate::types::Bookmark;

pub fn save_bookmark_db(db: &Database, bookmark: &Bookmark) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO bookmarks (id, book_id, chapter_id, highlight_id, label, note, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7)
         ON CONFLICT(id) DO UPDATE SET
            label = excluded.label,
            note = excluded.note",
        params![
            bookmark.id,
            bookmark.book_id,
            bookmark.chapter_id,
            bookmark.highlight_id,
            bookmark.label,
            bookmark.note,
            bookmark.created_at
        ],
    ) {
        eprintln!("[db] save_bookmark: {e}");
    }
}
