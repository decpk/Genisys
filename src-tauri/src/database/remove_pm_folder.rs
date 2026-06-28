use rusqlite::params;

use super::Database;

pub fn remove_pm_folder_db(db: &Database, folder_id: &str) {
    let conn = db.conn();
    // CASCADE will delete categories and prompts
    if let Err(e) = conn.execute("DELETE FROM pm_folders WHERE id = ?1", params![folder_id]) {
        eprintln!("[db] remove_pm_folder: {e}");
    }
}
