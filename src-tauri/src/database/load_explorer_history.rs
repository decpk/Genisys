use rusqlite::params;

use super::{Database, HISTORY_PAGE_SIZE};
use crate::types::*;

pub fn load_explorer_history_db(db: &Database, before_cursor: Option<&str>) -> ExplorerHistoryPage {
    let conn = db.reader();
    let fetch_limit = HISTORY_PAGE_SIZE + 1;
    let mut entries: Vec<ExplorerRepoEntry> = match before_cursor {
        Some(cursor) => {
            let mut stmt = match conn.prepare(
                "SELECT id, repository, source, organization, project, local_path, last_opened_at
                 FROM explorer_history WHERE last_opened_at < ?1 ORDER BY last_opened_at DESC LIMIT ?2",
            ) { Ok(s) => s, Err(e) => { eprintln!("[db] load_explorer_history prepare: {e}"); return ExplorerHistoryPage { items: vec![], has_more: false }; } };
            stmt.query_map(params![cursor, fetch_limit], |row| {
                Ok(ExplorerRepoEntry {
                    id: row.get(0)?, repository: row.get(1)?, source: row.get(2)?,
                    organization: row.get(3)?, project: row.get(4)?, local_path: row.get(5)?,
                    last_opened_at: row.get(6)?,
                })
            }).map(|rows| rows.filter_map(|r| r.ok()).collect()).unwrap_or_default()
        }
        None => {
            let mut stmt = match conn.prepare(
                "SELECT id, repository, source, organization, project, local_path, last_opened_at
                 FROM explorer_history ORDER BY last_opened_at DESC LIMIT ?1",
            ) { Ok(s) => s, Err(e) => { eprintln!("[db] load_explorer_history prepare: {e}"); return ExplorerHistoryPage { items: vec![], has_more: false }; } };
            stmt.query_map(params![fetch_limit], |row| {
                Ok(ExplorerRepoEntry {
                    id: row.get(0)?, repository: row.get(1)?, source: row.get(2)?,
                    organization: row.get(3)?, project: row.get(4)?, local_path: row.get(5)?,
                    last_opened_at: row.get(6)?,
                })
            }).map(|rows| rows.filter_map(|r| r.ok()).collect()).unwrap_or_default()
        }
    };
    let has_more = entries.len() as i64 > HISTORY_PAGE_SIZE;
    if has_more { entries.pop(); }
    ExplorerHistoryPage { items: entries, has_more }
}
