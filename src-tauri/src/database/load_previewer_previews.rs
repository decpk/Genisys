use super::Database;
use crate::types::*;

pub fn load_previewer_previews_db(db: &Database) -> Vec<SavedPreview> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, folder_id, url, final_url, title, description, site_name,
                favicon_url, image_url, theme_color, embeddable, notes, sort_order, created_at
         FROM weblinks_previews ORDER BY created_at DESC",
    ) { Ok(s) => s, Err(e) => { eprintln!("[db] load_previewer_previews prepare: {e}"); return vec![]; } };
    stmt.query_map([], |row| {
        Ok(SavedPreview {
            id: row.get(0)?,
            folder_id: row.get::<_, Option<String>>(1)?,
            url: row.get(2)?,
            final_url: row.get(3)?,
            title: row.get(4)?,
            description: row.get(5)?,
            site_name: row.get(6)?,
            favicon_url: row.get(7)?,
            image_url: row.get(8)?,
            theme_color: row.get(9)?,
            embeddable: row.get(10)?,
            notes: row.get(11)?,
            sort_order: row.get(12)?,
            created_at: row.get(13)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect()).unwrap_or_default()
}
