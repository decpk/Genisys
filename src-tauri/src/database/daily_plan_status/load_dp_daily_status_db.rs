use rusqlite::params;

use crate::database::Database;
use crate::types::DPDailyStatus;

/// Loads the daily-plan status row for a single date, if one exists.
pub fn load_dp_daily_status_db(db: &Database, date: &str) -> Option<DPDailyStatus> {
    let conn = db.reader();
    let mut stmt = conn
        .prepare(
            "SELECT date, content, created_at, updated_at
             FROM dp_daily_status
             WHERE date = ?1",
        )
        .unwrap();
    let results: Vec<DPDailyStatus> = stmt
        .query_map(params![date], |row| {
            Ok(DPDailyStatus {
                date: row.get(0)?,
                content: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
            })
        })
        .unwrap()
        .filter_map(|r| r.ok())
        .collect();
    results.into_iter().next()
}
