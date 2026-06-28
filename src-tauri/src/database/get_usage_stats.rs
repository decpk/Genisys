use serde_json::{json, Value};

use super::Database;

/// Aggregates over `app_usage_sessions`. Returns:
/// ```json
/// {
///   "totals": { "foregroundMs", "openMs", "sessionMs", "totalSessions" },
///   "perApp": [ { "appView", "foregroundMs", "openMs", "sessions", "avgForegroundMs" } ],
///   "perDay": [ { "date", "foregroundMs", "openMs", "sessions" } ],
///   "perHour": [ { "hour", "foregroundMs" } ],
///   "sessionTotals": { "count", "totalMs", "avgMs" }
/// }
/// ```
///
/// `from_date` / `to_date` are compared against `date_key` (`YYYY-MM-DD`).
pub fn get_usage_stats_db(db: &Database, from_date: Option<&str>, to_date: Option<&str>) -> Value {
    let conn = db.reader();

    // Build shared date-key conditions + params.
    let mut date_conditions: Vec<String> = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();
    let mut idx = 1;
    if let Some(f) = from_date {
        date_conditions.push(format!("date_key >= ?{idx}"));
        params.push(Box::new(f.to_string()));
        idx += 1;
    }
    if let Some(t) = to_date {
        date_conditions.push(format!("date_key <= ?{idx}"));
        params.push(Box::new(t.to_string()));
    }
    let params_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();

    let where_clause = |extra: &[&str]| -> String {
        let mut conds: Vec<String> = extra.iter().map(|s| s.to_string()).collect();
        conds.extend(date_conditions.clone());
        if conds.is_empty() {
            String::new()
        } else {
            format!("WHERE {}", conds.join(" AND "))
        }
    };

    // ── Totals ──────────────────────────────────────────────
    let totals_sql = format!(
        "SELECT
            COALESCE(SUM(CASE WHEN kind = 'foreground' THEN duration_ms ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN kind = 'open' THEN duration_ms ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN kind = 'session' THEN duration_ms ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN kind = 'session' THEN 1 ELSE 0 END), 0)
         FROM app_usage_sessions {}",
        where_clause(&[])
    );
    let (foreground_ms, open_ms, session_ms, total_sessions): (i64, i64, i64, i64) = conn
        .query_row(&totals_sql, params_refs.as_slice(), |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
        })
        .unwrap_or((0, 0, 0, 0));

    // ── Per app ─────────────────────────────────────────────
    let per_app_sql = format!(
        "SELECT app_view,
            COALESCE(SUM(CASE WHEN kind = 'foreground' THEN duration_ms ELSE 0 END), 0) AS fg_ms,
            COALESCE(SUM(CASE WHEN kind = 'open' THEN duration_ms ELSE 0 END), 0) AS open_ms,
            COALESCE(SUM(CASE WHEN kind = 'open' THEN 1 ELSE 0 END), 0) AS open_count,
            COALESCE(SUM(CASE WHEN kind = 'foreground' THEN 1 ELSE 0 END), 0) AS fg_count
         FROM app_usage_sessions {}
         GROUP BY app_view",
        where_clause(&["kind IN ('foreground','open')", "app_view IS NOT NULL"])
    );
    let mut per_app: Vec<Value> = Vec::new();
    if let Ok(mut stmt) = conn.prepare(&per_app_sql) {
        if let Ok(rows) = stmt.query_map(params_refs.as_slice(), |row| {
            let app_view: String = row.get(0)?;
            let fg_ms: i64 = row.get(1)?;
            let open_ms: i64 = row.get(2)?;
            let open_count: i64 = row.get(3)?;
            let fg_count: i64 = row.get(4)?;
            let avg_fg = fg_ms / fg_count.max(1);
            Ok(json!({
                "appView": app_view,
                "foregroundMs": fg_ms,
                "openMs": open_ms,
                "sessions": open_count,
                "avgForegroundMs": avg_fg,
            }))
        }) {
            for r in rows.flatten() {
                per_app.push(r);
            }
        }
    }

    // ── Per day ─────────────────────────────────────────────
    let per_day_sql = format!(
        "SELECT date_key,
            COALESCE(SUM(CASE WHEN kind = 'foreground' THEN duration_ms ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN kind = 'open' THEN duration_ms ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN kind = 'open' THEN 1 ELSE 0 END), 0)
         FROM app_usage_sessions {}
         GROUP BY date_key
         ORDER BY date_key ASC",
        where_clause(&[])
    );
    let mut per_day: Vec<Value> = Vec::new();
    if let Ok(mut stmt) = conn.prepare(&per_day_sql) {
        if let Ok(rows) = stmt.query_map(params_refs.as_slice(), |row| {
            let date: String = row.get(0)?;
            let fg_ms: i64 = row.get(1)?;
            let open_ms: i64 = row.get(2)?;
            let sessions: i64 = row.get(3)?;
            Ok(json!({
                "date": date,
                "foregroundMs": fg_ms,
                "openMs": open_ms,
                "sessions": sessions,
            }))
        }) {
            for r in rows.flatten() {
                per_day.push(r);
            }
        }
    }

    // ── Per hour ────────────────────────────────────────────
    let per_hour_sql = format!(
        "SELECT hour, COALESCE(SUM(duration_ms), 0)
         FROM app_usage_sessions {}
         GROUP BY hour
         ORDER BY hour ASC",
        where_clause(&["kind = 'foreground'"])
    );
    let mut per_hour: Vec<Value> = Vec::new();
    if let Ok(mut stmt) = conn.prepare(&per_hour_sql) {
        if let Ok(rows) = stmt.query_map(params_refs.as_slice(), |row| {
            let hour: i64 = row.get(0)?;
            let fg_ms: i64 = row.get(1)?;
            Ok(json!({
                "hour": hour,
                "foregroundMs": fg_ms,
            }))
        }) {
            for r in rows.flatten() {
                per_hour.push(r);
            }
        }
    }

    // ── Session totals (derived from totals query) ──────────
    let session_avg = session_ms / total_sessions.max(1);

    json!({
        "totals": {
            "foregroundMs": foreground_ms,
            "openMs": open_ms,
            "sessionMs": session_ms,
            "totalSessions": total_sessions,
        },
        "perApp": per_app,
        "perDay": per_day,
        "perHour": per_hour,
        "sessionTotals": {
            "count": total_sessions,
            "totalMs": session_ms,
            "avgMs": session_avg,
        },
    })
}
