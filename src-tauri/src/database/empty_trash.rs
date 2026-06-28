use super::Database;

pub fn empty_trash_db(db: &Database) {
    let conn = db.conn();
    if let Err(e) = conn.execute("DELETE FROM notes WHERE is_trashed = 1", []) {
        eprintln!("[db] empty_trash: {e}");
    }
}
