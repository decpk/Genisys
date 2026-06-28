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

fn req_i64(v: &Value, key: &str) -> Result<i64, String> {
    v.get(key)
        .and_then(|x| x.as_i64())
        .ok_or_else(|| format!("Missing field: {key}"))
}

pub fn save_usage_session_db(db: &Database, session: &Value) -> Result<String, String> {
    let conn = db.conn();

    let id = req_str(session, "id")?;
    let kind = req_str(session, "kind")?;
    let app_view = session.get("appView").and_then(as_str);
    let started_at = req_i64(session, "startedAt")?;
    let ended_at = req_i64(session, "endedAt")?;
    let duration_ms = req_i64(session, "durationMs")?;
    let date_key = req_str(session, "dateKey")?;
    let hour = req_i64(session, "hour")?;
    let created_at = chrono::Utc::now().timestamp_millis();

    conn.execute(
        "INSERT OR REPLACE INTO app_usage_sessions
         (id, app_view, kind, started_at, ended_at, duration_ms, date_key, hour, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            id,
            app_view,
            kind,
            started_at,
            ended_at,
            duration_ms,
            date_key,
            hour,
            created_at,
        ],
    )
    .map_err(|e| format!("save_usage_session: {e}"))?;

    Ok(id)
}
