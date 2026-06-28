use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_explorer_repo_db(db: &Database, entry: &ExplorerRepoEntry) {
    let conn = db.conn();
    let now = chrono::Utc::now().to_rfc3339();
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO explorer_history (repository, source, organization, project, local_path, last_opened_at)
         VALUES (?1,?2,?3,?4,?5,?6)",
        params![entry.repository, entry.source, entry.organization, entry.project, entry.local_path, now],
    ) { eprintln!("[db] save_explorer_repo: {e}"); }
}
