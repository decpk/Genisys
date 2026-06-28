use rusqlite::params;

use super::Database;

pub fn reorder_slides_db(db: &Database, presentation_id: &str, slide_ids: &[String]) {
    let conn = db.conn();
    for (index, slide_id) in slide_ids.iter().enumerate() {
        if let Err(e) = conn.execute(
            "UPDATE slides SET sort_order = ?1 WHERE id = ?2 AND presentation_id = ?3",
            params![index as i64, slide_id, presentation_id],
        ) {
            eprintln!("[db] reorder_slides: {e}");
        }
    }
}
