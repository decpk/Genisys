use rusqlite::params;

use super::Database;

pub fn remove_pm_category_db(db: &Database, category_id: &str) {
    let conn = db.conn();
    // CASCADE will delete prompts in this category
    if let Err(e) = conn.execute("DELETE FROM pm_categories WHERE id = ?1", params![category_id]) {
        eprintln!("[db] remove_pm_category: {e}");
    }
}
