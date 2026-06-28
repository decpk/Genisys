use rusqlite::params;

use super::Database;
use crate::types::Slide;

pub fn save_slide_db(db: &Database, slide: &Slide) {
    let conn = db.conn();
    let data_str = slide.data.to_string();
    if let Err(e) = conn.execute(
        "INSERT INTO slides (id, presentation_id, sort_order, title, notes, data, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8)
         ON CONFLICT(id) DO UPDATE SET
            presentation_id = excluded.presentation_id,
            sort_order = excluded.sort_order,
            title = excluded.title,
            notes = excluded.notes,
            data = excluded.data,
            updated_at = excluded.updated_at",
        params![
            slide.id,
            slide.presentation_id,
            slide.sort_order,
            slide.title,
            slide.notes,
            data_str,
            slide.created_at,
            slide.updated_at
        ],
    ) {
        eprintln!("[db] save_slide: {e}");
    }

    // Keep the presentation's slide_count and updated_at in sync.
    if let Err(e) = conn.execute(
        "UPDATE presentations SET
            slide_count = (SELECT COUNT(*) FROM slides WHERE presentation_id = ?1),
            updated_at = ?2
         WHERE id = ?1",
        params![slide.presentation_id, slide.updated_at],
    ) {
        eprintln!("[db] update_presentation_slide_count: {e}");
    }
}
