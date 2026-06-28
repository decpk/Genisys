use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_previewer_preview_db(db: &Database, preview: &SavedPreview) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO weblinks_previews
            (id, folder_id, url, final_url, title, description, site_name,
             favicon_url, image_url, theme_color, embeddable, notes, sort_order, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14)",
        params![preview.id, preview.folder_id, preview.url, preview.final_url,
                preview.title, preview.description, preview.site_name, preview.favicon_url,
                preview.image_url, preview.theme_color, preview.embeddable, preview.notes,
                preview.sort_order, preview.created_at],
    ) { eprintln!("[db] save_previewer_preview: {e}"); }
}
