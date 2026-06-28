use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn remove_explorer_repo_db(db: &Database, entry: &ExplorerRepoEntry) {
    let conn = db.conn();
    if entry.source == "local" {
        if let Some(ref lp) = entry.local_path {
            if let Err(e) = conn.execute("DELETE FROM explorer_history WHERE local_path = ?1", params![lp]) {
                eprintln!("[db] remove_explorer_repo (local): {e}");
            }
        }
    } else {
        if let Err(e) = conn.execute(
            "DELETE FROM explorer_history WHERE organization = ?1 AND project = ?2 AND repository = ?3",
            params![entry.organization, entry.project, entry.repository],
        ) { eprintln!("[db] remove_explorer_repo: {e}"); }
    }
}
