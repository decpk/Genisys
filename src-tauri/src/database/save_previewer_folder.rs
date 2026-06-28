use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_previewer_folder_db(db: &Database, folder: &PreviewFolder) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO weblinks_folders (id, name, color, parent_id, sort_order, created_at)
         VALUES (?1,?2,?3,?4,?5,?6)",
        params![folder.id, folder.name, folder.color, folder.parent_id,
                folder.sort_order, folder.created_at],
    ) { eprintln!("[db] save_previewer_folder: {e}"); }
}
