use rusqlite::params;

use super::Database;
use crate::types::PresentationMeta;

pub fn save_presentation_db(db: &Database, presentation: &PresentationMeta) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO presentations (id, title, description, slide_count, theme, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7)
         ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            slide_count = excluded.slide_count,
            theme = excluded.theme,
            updated_at = excluded.updated_at",
        params![
            presentation.id,
            presentation.title,
            presentation.description,
            presentation.slide_count,
            presentation.theme,
            presentation.created_at,
            presentation.updated_at
        ],
    ) {
        eprintln!("[db] save_presentation: {e}");
    }
}
