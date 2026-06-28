use rusqlite::params;

use crate::database::Database;
use crate::types::DPReview;

/// Inserts or updates a single daily-plan review row.
pub fn save_dp_review_db(db: &Database, review: &DPReview) {
    let conn = db.conn();
    conn.execute(
        "INSERT OR REPLACE INTO dp_reviews (
            id, title, description, status, priority, review_type, link,
            scheduled_date, scheduled_time, duration_minutes, reminder_at,
            sort_order, completed_at, created_at, updated_at,
            author_name, author_avatar_url
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
        params![
            review.id,
            review.title,
            review.description,
            review.status,
            review.priority,
            review.review_type,
            review.link,
            review.scheduled_date,
            review.scheduled_time,
            review.duration_minutes,
            review.reminder_at,
            review.sort_order,
            review.completed_at,
            review.created_at,
            review.updated_at,
            review.author_name,
            review.author_avatar_url,
        ],
    )
    .map_err(|e| eprintln!("[db] save_dp_review: {e}"))
    .ok();
}
