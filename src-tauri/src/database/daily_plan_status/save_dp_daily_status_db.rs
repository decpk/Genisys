use rusqlite::params;

use crate::database::Database;
use crate::types::DPDailyStatus;

/// Inserts or updates the daily-plan status row for a single date.
pub fn save_dp_daily_status_db(db: &Database, status: &DPDailyStatus) {
    let conn = db.conn();
    conn.execute(
        "INSERT OR REPLACE INTO dp_daily_status (
            date, content, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4)",
        params![
            status.date,
            status.content,
            status.created_at,
            status.updated_at,
        ],
    )
    .map_err(|e| eprintln!("[db] save_dp_daily_status: {e}"))
    .ok();
}
