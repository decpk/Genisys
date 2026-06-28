use rusqlite::params;
use serde_json::Value;

use super::Database;

fn as_str(v: &Value) -> Option<String> {
    match v {
        Value::String(s) => Some(s.clone()),
        Value::Number(n) => Some(n.to_string()),
        Value::Bool(b) => Some(b.to_string()),
        Value::Null => None,
        _ => None,
    }
}

fn req_str(v: &Value, key: &str) -> Result<String, String> {
    v.get(key)
        .and_then(|x| as_str(x))
        .ok_or_else(|| format!("Missing field: {key}"))
}

pub fn save_timer_session_db(db: &Database, session: &Value) -> Result<String, String> {
    let conn = db.conn();

    let id = req_str(session, "id")?;
    let instance_id = req_str(session, "instanceId")?;
    let mode = req_str(session, "mode")?;
    let phase = req_str(session, "phase")?;
    let task_id = session.get("taskId").and_then(as_str);
    let daily_plan_task_id = session.get("dailyPlanTaskId").and_then(as_str);
    let tag_id = session.get("tagId").and_then(as_str);
    let started_at = req_str(session, "startedAt")?;
    let completed_at = req_str(session, "completedAt")?;
    let duration_sec = session
        .get("durationSec")
        .and_then(|v| v.as_i64())
        .ok_or_else(|| "Missing field: durationSec".to_string())?;
    let was_completed = session
        .get("wasCompleted")
        .and_then(|v| v.as_bool())
        .unwrap_or(true);

    conn.execute(
        "INSERT OR REPLACE INTO timer_sessions
         (id, instance_id, mode, phase, task_id, daily_plan_task_id, tag_id, started_at, completed_at, duration_sec, was_completed)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            id,
            instance_id,
            mode,
            phase,
            task_id,
            daily_plan_task_id,
            tag_id,
            started_at,
            completed_at,
            duration_sec,
            if was_completed { 1i64 } else { 0i64 },
        ],
    )
    .map_err(|e| format!("save_timer_session: {e}"))?;

    Ok(id)
}
