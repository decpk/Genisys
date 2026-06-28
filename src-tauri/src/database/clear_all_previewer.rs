use super::Database;

/// Delete every saved preview and every folder. Previews are removed first so a
/// failure can't leave previews referencing a deleted folder.
pub fn clear_all_previewer_db(db: &Database) {
    let conn = db.conn();
    if let Err(e) = conn.execute("DELETE FROM weblinks_previews", []) {
        eprintln!("[db] clear_all_previewer previews: {e}");
    }
    if let Err(e) = conn.execute("DELETE FROM weblinks_folders", []) {
        eprintln!("[db] clear_all_previewer folders: {e}");
    }
}
