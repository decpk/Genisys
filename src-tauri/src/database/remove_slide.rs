use rusqlite::params;

use super::Database;

pub fn remove_slide_db(db: &Database, slide_id: &str) {
    let conn = db.conn();
    // Capture the parent presentation so its slide_count can be refreshed after.
    let presentation_id: Option<String> = conn
        .query_row(
            "SELECT presentation_id FROM slides WHERE id = ?1",
            params![slide_id],
            |row| row.get(0),
        )
        .ok();

    if let Err(e) = conn.execute("DELETE FROM slides WHERE id = ?1", params![slide_id]) {
        eprintln!("[db] remove_slide: {e}");
    }

    if let Some(pid) = presentation_id {
        if let Err(e) = conn.execute(
            "UPDATE presentations SET
                slide_count = (SELECT COUNT(*) FROM slides WHERE presentation_id = ?1)
             WHERE id = ?1",
            params![pid],
        ) {
            eprintln!("[db] update_presentation_slide_count: {e}");
        }
    }
}
