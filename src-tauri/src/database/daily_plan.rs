use rusqlite::params;

use crate::database::Database;
use crate::types::*;

// ─── Tasks ───────────────────────────────────────────────────

pub fn save_dp_task_db(db: &Database, task: &DPTask) {
    let conn = db.conn();
    conn.execute(
        "INSERT OR REPLACE INTO dp_tasks (
            id, title, description, status, priority, category_id,
            scheduled_date, scheduled_time, duration_minutes, reminder_at,
            sort_order, completed_at, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
        params![
            task.id,
            task.title,
            task.description,
            task.status,
            task.priority,
            task.category_id,
            task.scheduled_date,
            task.scheduled_time,
            task.duration_minutes,
            task.reminder_at,
            task.sort_order,
            task.completed_at,
            task.created_at,
            task.updated_at,
        ],
    )
    .map_err(|e| eprintln!("[db] save_dp_task: {e}"))
    .ok();
}

pub fn load_dp_tasks_db(db: &Database, start_date: &str, end_date: &str) -> Vec<DPTask> {
    let conn = db.reader();
    let mut stmt = conn
        .prepare(
            "SELECT id, title, description, status, priority, category_id,
                    scheduled_date, scheduled_time, duration_minutes, reminder_at,
                    sort_order, completed_at, created_at, updated_at
             FROM dp_tasks
             WHERE scheduled_date BETWEEN ?1 AND ?2
             ORDER BY sort_order",
        )
        .unwrap();
    stmt.query_map(params![start_date, end_date], |row| {
        Ok(DPTask {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            status: row.get(3)?,
            priority: row.get(4)?,
            category_id: row.get(5)?,
            scheduled_date: row.get(6)?,
            scheduled_time: row.get(7)?,
            duration_minutes: row.get(8)?,
            reminder_at: row.get(9)?,
            sort_order: row.get(10)?,
            completed_at: row.get(11)?,
            created_at: row.get(12)?,
            updated_at: row.get(13)?,
        })
    })
    .unwrap()
    .filter_map(|r| r.ok())
    .collect()
}

pub fn remove_dp_task_db(db: &Database, id: &str) {
    let conn = db.conn();
    conn.execute("DELETE FROM dp_tasks WHERE id = ?1", params![id])
        .map_err(|e| eprintln!("[db] remove_dp_task: {e}"))
        .ok();
}

pub fn reorder_dp_tasks_db(db: &Database, ordered_ids: &[String]) {
    let conn = db.conn();
    for (index, id) in ordered_ids.iter().enumerate() {
        conn.execute(
            "UPDATE dp_tasks SET sort_order = ?1 WHERE id = ?2",
            params![index as i64, id],
        )
        .map_err(|e| eprintln!("[db] reorder_dp_tasks: {e}"))
        .ok();
    }
}

pub fn bulk_update_dp_task_status_db(
    db: &Database,
    ids: &[String],
    status: &str,
    completed_at: Option<&str>,
) {
    let conn = db.conn();
    for id in ids {
        conn.execute(
            "UPDATE dp_tasks SET status = ?1, completed_at = ?2, updated_at = datetime('now') WHERE id = ?3",
            params![status, completed_at, id],
        )
        .map_err(|e| eprintln!("[db] bulk_update_dp_task_status: {e}"))
        .ok();
    }
}

// ─── Meetings ────────────────────────────────────────────────

pub fn save_dp_meeting_db(db: &Database, meeting: &DPMeeting) {
    let conn = db.conn();
    conn.execute(
        "INSERT OR REPLACE INTO dp_meetings (
            id, title, description, scheduled_date, start_time, end_time,
            location, meeting_link, reminder_at, status, meeting_type, priority,
            notes, follow_up, agenda, outcome, attendees, cancel_reason,
            sort_order, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21)",
        params![
            meeting.id,
            meeting.title,
            meeting.description,
            meeting.scheduled_date,
            meeting.start_time,
            meeting.end_time,
            meeting.location,
            meeting.meeting_link,
            meeting.reminder_at,
            meeting.status,
            meeting.meeting_type,
            meeting.priority,
            meeting.notes,
            meeting.follow_up,
            meeting.agenda,
            meeting.outcome,
            meeting.attendees,
            meeting.cancel_reason,
            meeting.sort_order,
            meeting.created_at,
            meeting.updated_at,
        ],
    )
    .map_err(|e| eprintln!("[db] save_dp_meeting: {e}"))
    .ok();
}

pub fn load_dp_meetings_db(db: &Database, start_date: &str, end_date: &str) -> Vec<DPMeeting> {
    let conn = db.reader();
    let mut stmt = conn
        .prepare(
            "SELECT id, title, description, scheduled_date, start_time, end_time,
                    location, meeting_link, reminder_at, status, meeting_type, priority,
                    notes, follow_up, agenda, outcome, attendees, cancel_reason,
                    sort_order, created_at, updated_at
             FROM dp_meetings
             WHERE scheduled_date BETWEEN ?1 AND ?2
             ORDER BY start_time",
        )
        .unwrap();
    stmt.query_map(params![start_date, end_date], |row| {
        Ok(DPMeeting {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            scheduled_date: row.get(3)?,
            start_time: row.get(4)?,
            end_time: row.get(5)?,
            location: row.get(6)?,
            meeting_link: row.get(7)?,
            reminder_at: row.get(8)?,
            status: row.get(9)?,
            meeting_type: row.get(10)?,
            priority: row.get(11)?,
            notes: row.get(12)?,
            follow_up: row.get(13)?,
            agenda: row.get(14)?,
            outcome: row.get(15)?,
            attendees: row.get(16)?,
            cancel_reason: row.get(17)?,
            sort_order: row.get(18)?,
            created_at: row.get(19)?,
            updated_at: row.get(20)?,
        })
    })
    .unwrap()
    .filter_map(|r| r.ok())
    .collect()
}

pub fn remove_dp_meeting_db(db: &Database, id: &str) {
    let conn = db.conn();
    conn.execute("DELETE FROM dp_meetings WHERE id = ?1", params![id])
        .map_err(|e| eprintln!("[db] remove_dp_meeting: {e}"))
        .ok();
}

// ─── Daily Entries ───────────────────────────────────────────

pub fn save_dp_daily_entry_db(db: &Database, entry: &DPDailyEntry) {
    let conn = db.conn();
    conn.execute(
        "INSERT OR REPLACE INTO dp_daily_entries (
            id, date, motivational_quote, status_content, yesterday_review,
            work_start_time, work_end_time, lunch_start_time, lunch_end_time,
            created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            entry.id,
            entry.date,
            entry.motivational_quote,
            entry.status_content,
            entry.yesterday_review,
            entry.work_start_time,
            entry.work_end_time,
            entry.lunch_start_time,
            entry.lunch_end_time,
            entry.created_at,
            entry.updated_at,
        ],
    )
    .map_err(|e| eprintln!("[db] save_dp_daily_entry: {e}"))
    .ok();
}

pub fn load_dp_daily_entry_db(db: &Database, date: &str) -> Option<DPDailyEntry> {
    let conn = db.reader();
    let mut stmt = conn
        .prepare(
            "SELECT id, date, motivational_quote, status_content, yesterday_review,
                    work_start_time, work_end_time, lunch_start_time, lunch_end_time,
                    created_at, updated_at
             FROM dp_daily_entries
             WHERE date = ?1",
        )
        .unwrap();
    let results: Vec<DPDailyEntry> = stmt.query_map(params![date], |row| {
        Ok(DPDailyEntry {
            id: row.get(0)?,
            date: row.get(1)?,
            motivational_quote: row.get(2)?,
            status_content: row.get(3)?,
            yesterday_review: row.get(4)?,
            work_start_time: row.get(5)?,
            work_end_time: row.get(6)?,
            lunch_start_time: row.get(7)?,
            lunch_end_time: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })
    .unwrap()
    .filter_map(|r| r.ok())
    .collect();
    results.into_iter().next()
}

pub fn load_dp_daily_entries_range_db(
    db: &Database,
    start: &str,
    end: &str,
) -> Vec<DPDailyEntry> {
    let conn = db.reader();
    let mut stmt = conn
        .prepare(
            "SELECT id, date, motivational_quote, status_content, yesterday_review,
                    work_start_time, work_end_time, lunch_start_time, lunch_end_time,
                    created_at, updated_at
             FROM dp_daily_entries
             WHERE date BETWEEN ?1 AND ?2
             ORDER BY date",
        )
        .unwrap();
    stmt.query_map(params![start, end], |row| {
        Ok(DPDailyEntry {
            id: row.get(0)?,
            date: row.get(1)?,
            motivational_quote: row.get(2)?,
            status_content: row.get(3)?,
            yesterday_review: row.get(4)?,
            work_start_time: row.get(5)?,
            work_end_time: row.get(6)?,
            lunch_start_time: row.get(7)?,
            lunch_end_time: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })
    .unwrap()
    .filter_map(|r| r.ok())
    .collect()
}

// ─── Categories ──────────────────────────────────────────────

pub fn save_dp_category_db(db: &Database, category: &DPCategory) {
    let conn = db.conn();
    conn.execute(
        "INSERT OR REPLACE INTO dp_categories (
            id, name, color, icon, sort_order, created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            category.id,
            category.name,
            category.color,
            category.icon,
            category.sort_order,
            category.created_at,
        ],
    )
    .map_err(|e| eprintln!("[db] save_dp_category: {e}"))
    .ok();
}

pub fn load_dp_categories_db(db: &Database) -> Vec<DPCategory> {
    let conn = db.reader();
    let mut stmt = conn
        .prepare(
            "SELECT id, name, color, icon, sort_order, created_at
             FROM dp_categories
             ORDER BY sort_order",
        )
        .unwrap();
    stmt.query_map(params![], |row| {
        Ok(DPCategory {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            icon: row.get(3)?,
            sort_order: row.get(4)?,
            created_at: row.get(5)?,
        })
    })
    .unwrap()
    .filter_map(|r| r.ok())
    .collect()
}

pub fn remove_dp_category_db(db: &Database, id: &str) {
    let conn = db.conn();
    conn.execute(
        "UPDATE dp_tasks SET category_id = NULL WHERE category_id = ?1",
        params![id],
    )
    .map_err(|e| eprintln!("[db] remove_dp_category (nullify tasks): {e}"))
    .ok();
    conn.execute("DELETE FROM dp_categories WHERE id = ?1", params![id])
        .map_err(|e| eprintln!("[db] remove_dp_category: {e}"))
        .ok();
}

// ─── Templates ───────────────────────────────────────────────

pub fn save_dp_template_db(db: &Database, template: &DPTemplate) {
    let conn = db.conn();
    conn.execute(
        "INSERT OR REPLACE INTO dp_templates (
            id, name, description, template_type, content,
            is_built_in, sort_order, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            template.id,
            template.name,
            template.description,
            template.template_type,
            template.content,
            template.is_built_in as i64,
            template.sort_order,
            template.created_at,
            template.updated_at,
        ],
    )
    .map_err(|e| eprintln!("[db] save_dp_template: {e}"))
    .ok();
}

pub fn load_dp_templates_db(db: &Database) -> Vec<DPTemplate> {
    let conn = db.reader();
    let mut stmt = conn
        .prepare(
            "SELECT id, name, description, template_type, content,
                    is_built_in, sort_order, created_at, updated_at
             FROM dp_templates
             ORDER BY sort_order",
        )
        .unwrap();
    stmt.query_map(params![], |row| {
        Ok(DPTemplate {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            template_type: row.get(3)?,
            content: row.get(4)?,
            is_built_in: row.get::<_, i64>(5)? != 0,
            sort_order: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    })
    .unwrap()
    .filter_map(|r| r.ok())
    .collect()
}

pub fn remove_dp_template_db(db: &Database, id: &str) {
    let conn = db.conn();
    conn.execute(
        "DELETE FROM dp_templates WHERE id = ?1 AND is_built_in = 0",
        params![id],
    )
    .map_err(|e| eprintln!("[db] remove_dp_template: {e}"))
    .ok();
}

// ─── Search ──────────────────────────────────────────────────

pub fn search_dp_tasks_db(db: &Database, query: &str) -> Vec<DPTask> {
    let conn = db.reader();
    let pattern = format!("%{query}%");
    let mut stmt = conn
        .prepare(
            "SELECT id, title, description, status, priority, category_id,
                    scheduled_date, scheduled_time, duration_minutes, reminder_at,
                    sort_order, completed_at, created_at, updated_at
             FROM dp_tasks
             WHERE title LIKE ?1 OR description LIKE ?1
             ORDER BY scheduled_date DESC, sort_order
             LIMIT 50",
        )
        .unwrap();
    stmt.query_map(params![pattern], |row| {
        Ok(DPTask {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            status: row.get(3)?,
            priority: row.get(4)?,
            category_id: row.get(5)?,
            scheduled_date: row.get(6)?,
            scheduled_time: row.get(7)?,
            duration_minutes: row.get(8)?,
            reminder_at: row.get(9)?,
            sort_order: row.get(10)?,
            completed_at: row.get(11)?,
            created_at: row.get(12)?,
            updated_at: row.get(13)?,
        })
    })
    .unwrap()
    .filter_map(|r| r.ok())
    .collect()
}

pub fn search_dp_meetings_db(db: &Database, query: &str) -> Vec<DPMeeting> {
    let conn = db.reader();
    let pattern = format!("%{query}%");
    let mut stmt = conn
        .prepare(
            "SELECT id, title, description, scheduled_date, start_time, end_time,
                    location, meeting_link, reminder_at, status, meeting_type, priority,
                    notes, follow_up, agenda, outcome, attendees, cancel_reason,
                    sort_order, created_at, updated_at
             FROM dp_meetings
             WHERE title LIKE ?1 OR description LIKE ?1
             ORDER BY scheduled_date DESC, start_time DESC
             LIMIT 50",
        )
        .unwrap();
    stmt.query_map(params![pattern], |row| {
        Ok(DPMeeting {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            scheduled_date: row.get(3)?,
            start_time: row.get(4)?,
            end_time: row.get(5)?,
            location: row.get(6)?,
            meeting_link: row.get(7)?,
            reminder_at: row.get(8)?,
            status: row.get(9)?,
            meeting_type: row.get(10)?,
            priority: row.get(11)?,
            notes: row.get(12)?,
            follow_up: row.get(13)?,
            agenda: row.get(14)?,
            outcome: row.get(15)?,
            attendees: row.get(16)?,
            cancel_reason: row.get(17)?,
            sort_order: row.get(18)?,
            created_at: row.get(19)?,
            updated_at: row.get(20)?,
        })
    })
    .unwrap()
    .filter_map(|r| r.ok())
    .collect()
}
