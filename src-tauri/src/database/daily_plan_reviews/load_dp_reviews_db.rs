use rusqlite::params;

use crate::database::Database;
use crate::types::DPReview;

/// Loads all daily-plan reviews scheduled within `[start_date, end_date]`.
pub fn load_dp_reviews_db(db: &Database, start_date: &str, end_date: &str) -> Vec<DPReview> {
    let conn = db.reader();
    let mut stmt = conn
        .prepare(
            "SELECT id, title, description, status, priority, review_type, link,
                    scheduled_date, scheduled_time, duration_minutes, reminder_at,
                    sort_order, completed_at, created_at, updated_at,
                    author_name, author_avatar_url
             FROM dp_reviews
             WHERE scheduled_date BETWEEN ?1 AND ?2
             ORDER BY sort_order",
        )
        .unwrap();
    stmt.query_map(params![start_date, end_date], |row| {
        Ok(DPReview {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            status: row.get(3)?,
            priority: row.get(4)?,
            review_type: row.get(5)?,
            link: row.get(6)?,
            scheduled_date: row.get(7)?,
            scheduled_time: row.get(8)?,
            duration_minutes: row.get(9)?,
            reminder_at: row.get(10)?,
            sort_order: row.get(11)?,
            completed_at: row.get(12)?,
            created_at: row.get(13)?,
            updated_at: row.get(14)?,
            author_name: row.get(15)?,
            author_avatar_url: row.get(16)?,
        })
    })
    .unwrap()
    .filter_map(|r| r.ok())
    .collect()
}
