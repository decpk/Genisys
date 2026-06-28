use rusqlite::params;

use super::Database;

pub fn update_clipboard_image_description_db(
    db: &Database,
    id: &str,
    description: &str,
    status: &str,
) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "UPDATE clipboard_items SET image_description = ?1, analysis_status = ?2 WHERE id = ?3",
        params![description, status, id],
    ) {
        eprintln!("[db] update_clipboard_image_description: {e}");
    }
}
