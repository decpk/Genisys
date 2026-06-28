use rusqlite::params;
use super::Database;

/// Move a notebook into a different project. Pass `None` to detach the
/// notebook (no project). The notebook's notes/sections/topics travel with
/// it because they live under the notebook, not the project directly.
pub fn move_notebook_to_project_db(
    db: &Database,
    notebook_id: &str,
    new_project_id: Option<&str>,
) {
    let conn = db.conn();
    let now = chrono::Utc::now().to_rfc3339();

    if let Err(e) = conn.execute(
        "UPDATE note_notebooks SET project_id=?1, updated_at=?2 WHERE id=?3",
        params![new_project_id, now, notebook_id],
    ) {
        eprintln!("[db] move_notebook_to_project: {e}");
    }
}
