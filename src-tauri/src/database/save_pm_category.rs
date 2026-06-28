use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_pm_category_db(db: &Database, category: &PmCategory) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO pm_categories (id, folder_id, name, icon, sort_order, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7)
         ON CONFLICT(id) DO UPDATE SET
            folder_id = excluded.folder_id,
            name = excluded.name,
            icon = excluded.icon,
            sort_order = excluded.sort_order,
            updated_at = excluded.updated_at",
        params![category.id, category.folder_id, category.name, category.icon, category.sort_order, category.created_at, category.updated_at],
    ) {
        eprintln!("[db] save_pm_category: {e}");
    }
}
