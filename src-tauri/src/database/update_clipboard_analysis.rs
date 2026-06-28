use rusqlite::params;

use super::Database;

/// Persists computed content analysis (smart categories, sensitivity level, and
/// sensitivity matches — the latter two stored as JSON text) for a single item.
pub fn update_clipboard_analysis_db(
    db: &Database,
    id: &str,
    smart_categories_json: &str,
    sensitivity_level: &str,
    sensitivity_matches_json: &str,
) -> bool {
    let conn = db.conn();

    if let Err(e) = conn.execute(
        "UPDATE clipboard_items
         SET smart_categories = ?1, sensitivity_level = ?2, sensitivity_matches = ?3
         WHERE id = ?4",
        params![
            smart_categories_json,
            sensitivity_level,
            sensitivity_matches_json,
            id
        ],
    ) {
        eprintln!("[db] update_clipboard_analysis: {e}");
        return false;
    }

    true
}
