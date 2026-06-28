use serde_json::{json, Value};

use super::Database;

pub fn load_timer_sessions_db(
    db: &Database,
    task_id: Option<&str>,
    daily_plan_task_id: Option<&str>,
    tag_id: Option<&str>,
    from_date: Option<&str>,
    to_date: Option<&str>,
    limit: i64,
    offset: i64,
) -> (Vec<Value>, bool) {
    let conn = db.reader();
    let fetch_limit = limit + 1;

    let mut conditions: Vec<String> = Vec::new();
    let mut param_values: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();
    let mut idx = 1;

    if let Some(t) = task_id {
        conditions.push(format!("task_id = ?{idx}"));
        param_values.push(Box::new(t.to_string()));
        idx += 1;
    }
    if let Some(t) = daily_plan_task_id {
        conditions.push(format!("daily_plan_task_id = ?{idx}"));
        param_values.push(Box::new(t.to_string()));
        idx += 1;
    }
    if let Some(t) = tag_id {
        conditions.push(format!("tag_id = ?{idx}"));
        param_values.push(Box::new(t.to_string()));
        idx += 1;
    }
    if let Some(f) = from_date {
        conditions.push(format!("completed_at >= ?{idx}"));
        param_values.push(Box::new(f.to_string()));
        idx += 1;
    }
    if let Some(t) = to_date {
        conditions.push(format!("completed_at <= ?{idx}"));
        param_values.push(Box::new(t.to_string()));
        idx += 1;
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let sql = format!(
        "SELECT id, instance_id, mode, phase, task_id, daily_plan_task_id, tag_id,
                started_at, completed_at, duration_sec, was_completed
         FROM timer_sessions {where_clause}
         ORDER BY completed_at DESC
         LIMIT ?{idx} OFFSET ?{}",
        idx + 1
    );
    param_values.push(Box::new(fetch_limit));
    param_values.push(Box::new(offset));

    let params_refs: Vec<&dyn rusqlite::types::ToSql> =
        param_values.iter().map(|p| p.as_ref()).collect();

    let mut stmt = match conn.prepare(&sql) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_timer_sessions prepare: {e}");
            return (vec![], false);
        }
    };

    let mut items: Vec<Value> = stmt
        .query_map(params_refs.as_slice(), |row| {
            let was_completed: i64 = row.get(10)?;
            Ok(json!({
                "id": row.get::<_, String>(0)?,
                "instanceId": row.get::<_, String>(1)?,
                "mode": row.get::<_, String>(2)?,
                "phase": row.get::<_, String>(3)?,
                "taskId": row.get::<_, Option<String>>(4)?,
                "dailyPlanTaskId": row.get::<_, Option<String>>(5)?,
                "tagId": row.get::<_, Option<String>>(6)?,
                "startedAt": row.get::<_, String>(7)?,
                "completedAt": row.get::<_, String>(8)?,
                "durationSec": row.get::<_, i64>(9)?,
                "wasCompleted": was_completed != 0,
            }))
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default();

    let has_more = items.len() as i64 > limit;
    if has_more {
        items.pop();
    }

    (items, has_more)
}
