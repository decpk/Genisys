use rusqlite::params;
use super::Database;

/// Hard-delete a project and ALL of its notebooks (which in turn cascade
/// to sections → topics → notes via existing schema FKs).
///
/// System projects are protected — `is_system=1` rows cannot be removed.
pub fn remove_note_project_db(db: &Database, project_id: &str) {
    let conn = db.conn();

    // 1. Explicitly remove notebooks under this project. Their FKs already
    //    cascade to note_sections → note_topics → notes.
    if let Err(e) = conn.execute(
        "DELETE FROM note_notebooks WHERE project_id=?1",
        params![project_id],
    ) {
        eprintln!("[db] remove_note_project (notebooks): {e}");
        return;
    }

    // 2. Delete the project itself (system projects are protected).
    if let Err(e) = conn.execute(
        "DELETE FROM note_projects WHERE id=?1 AND is_system=0",
        params![project_id],
    ) {
        eprintln!("[db] remove_note_project (project): {e}");
    }
}
