use serde_json::{json, Value};

use super::Database;

/// Aggregates over `timer_sessions`:
///   `{ totalMinutes, totalSessions, perTag: [{tagId, minutes, sessions}],
///      perDay: [{date, minutes, sessions}], longestStreak }`
///
/// `from_date` / `to_date` are compared against `completed_at` lexicographically
/// (ISO-8601 strings or numeric ms strings — caller picks the format).
pub fn get_timer_stats_db(db: &Database, from_date: Option<&str>, to_date: Option<&str>) -> Value {
    let conn = db.reader();

    let mut conditions: Vec<String> = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();
    let mut idx = 1;
    if let Some(f) = from_date {
        conditions.push(format!("completed_at >= ?{idx}"));
        params.push(Box::new(f.to_string()));
        idx += 1;
    }
    if let Some(t) = to_date {
        conditions.push(format!("completed_at <= ?{idx}"));
        params.push(Box::new(t.to_string()));
    }
    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };
    let params_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();

    // Totals
    let totals_sql = format!(
        "SELECT COALESCE(SUM(duration_sec), 0), COUNT(*) FROM timer_sessions {where_clause}"
    );
    let (total_secs, total_sessions): (i64, i64) = conn
        .query_row(&totals_sql, params_refs.as_slice(), |row| {
            Ok((row.get(0)?, row.get(1)?))
        })
        .unwrap_or((0, 0));
    let total_minutes = total_secs / 60;

    // Per tag
    let per_tag_sql = format!(
        "SELECT COALESCE(tag_id, ''), SUM(duration_sec), COUNT(*)
         FROM timer_sessions {where_clause}
         GROUP BY tag_id"
    );
    let mut per_tag: Vec<Value> = Vec::new();
    if let Ok(mut stmt) = conn.prepare(&per_tag_sql) {
        if let Ok(rows) = stmt.query_map(params_refs.as_slice(), |row| {
            let tag: String = row.get(0)?;
            let secs: i64 = row.get(1)?;
            let count: i64 = row.get(2)?;
            Ok(json!({
                "tagId": if tag.is_empty() { Value::Null } else { Value::String(tag) },
                "minutes": secs / 60,
                "sessions": count,
            }))
        }) {
            for r in rows.flatten() {
                per_tag.push(r);
            }
        }
    }

    // Per day — bucket by the first 10 chars of completed_at (works for both
    // ISO-8601 dates and YYYY-MM-DD prefixes).
    let per_day_sql = format!(
        "SELECT substr(completed_at, 1, 10) AS day, SUM(duration_sec), COUNT(*)
         FROM timer_sessions {where_clause}
         GROUP BY day
         ORDER BY day ASC"
    );
    let mut per_day: Vec<Value> = Vec::new();
    let mut day_set: Vec<String> = Vec::new();
    if let Ok(mut stmt) = conn.prepare(&per_day_sql) {
        if let Ok(rows) = stmt.query_map(params_refs.as_slice(), |row| {
            let day: String = row.get(0)?;
            let secs: i64 = row.get(1)?;
            let count: i64 = row.get(2)?;
            Ok((day, secs, count))
        }) {
            for r in rows.flatten() {
                day_set.push(r.0.clone());
                per_day.push(json!({
                    "date": r.0,
                    "minutes": r.1 / 60,
                    "sessions": r.2,
                }));
            }
        }
    }

    // Longest streak — count the longest run of consecutive YYYY-MM-DD days.
    let longest_streak = compute_longest_streak(&day_set);

    json!({
        "totalMinutes": total_minutes,
        "totalSessions": total_sessions,
        "perTag": per_tag,
        "perDay": per_day,
        "longestStreak": longest_streak,
    })
}

fn compute_longest_streak(days: &[String]) -> i64 {
    // Filter to YYYY-MM-DD parseable
    let parsed: Vec<chrono::NaiveDate> = days
        .iter()
        .filter_map(|d| chrono::NaiveDate::parse_from_str(d, "%Y-%m-%d").ok())
        .collect();
    if parsed.is_empty() {
        return 0;
    }
    let mut sorted: Vec<chrono::NaiveDate> = parsed;
    sorted.sort();
    sorted.dedup();

    let mut longest = 1i64;
    let mut current = 1i64;
    for w in sorted.windows(2) {
        if w[1] == w[0] + chrono::Duration::days(1) {
            current += 1;
            if current > longest {
                longest = current;
            }
        } else {
            current = 1;
        }
    }
    longest
}
