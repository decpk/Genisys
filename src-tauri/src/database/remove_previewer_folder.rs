use rusqlite::params;

use super::Database;

pub fn remove_previewer_folder_db(db: &Database, folder_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "UPDATE weblinks_previews SET folder_id = NULL WHERE folder_id = ?1",
        params![folder_id],
    ) { eprintln!("[db] remove_previewer_folder unfile previews: {e}"); }
    if let Err(e) = conn.execute(
        "UPDATE weblinks_folders SET parent_id = NULL WHERE parent_id = ?1",
        params![folder_id],
    ) { eprintln!("[db] remove_previewer_folder unparent children: {e}"); }
    if let Err(e) = conn.execute(
        "DELETE FROM weblinks_folders WHERE id = ?1",
        params![folder_id],
    ) { eprintln!("[db] remove_previewer_folder delete: {e}"); }
}
