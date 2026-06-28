use super::Database;
use crate::types::{PresentationMeta, PresentationWithSlides, Slide};

pub fn load_presentation_with_slides_db(
    db: &Database,
    presentation_id: &str,
) -> Option<PresentationWithSlides> {
    let conn = db.reader();

    let presentation = match conn.query_row(
        "SELECT id, title, description, slide_count, theme, created_at, updated_at
         FROM presentations WHERE id = ?1",
        rusqlite::params![presentation_id],
        |row| {
            Ok(PresentationMeta {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                slide_count: row.get(3)?,
                theme: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        },
    ) {
        Ok(p) => p,
        Err(_) => return None,
    };

    let mut stmt = match conn.prepare(
        "SELECT id, presentation_id, sort_order, title, notes, data, created_at, updated_at
         FROM slides WHERE presentation_id = ?1 ORDER BY sort_order ASC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_presentation_slides: {e}");
            return Some(PresentationWithSlides { presentation, slides: vec![] });
        }
    };

    let slides = stmt
        .query_map(rusqlite::params![presentation_id], |row| {
            let data_str: String = row.get(5)?;
            let data = serde_json::from_str(&data_str).unwrap_or(serde_json::Value::Null);
            Ok(Slide {
                id: row.get(0)?,
                presentation_id: row.get(1)?,
                sort_order: row.get(2)?,
                title: row.get(3)?,
                notes: row.get(4)?,
                data,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default();

    Some(PresentationWithSlides { presentation, slides })
}
