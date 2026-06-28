use rusqlite::params;
use serde_json::Value;

use super::Database;

fn as_str_or_num(v: Option<&Value>) -> Option<String> {
    match v? {
        Value::String(s) => Some(s.clone()),
        Value::Number(n) => Some(n.to_string()),
        _ => None,
    }
}

pub fn save_timer_goal_db(db: &Database, goal: &Value) -> Result<String, String> {
    let conn = db.conn();

    let id = goal
        .get("id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| "Missing field: id".to_string())?
        .to_string();
    let goal_type = goal
        .get("goalType")
        .and_then(|v| v.as_str())
        .ok_or_else(|| "Missing field: goalType".to_string())?
        .to_string();
    let target_value = goal
        .get("targetValue")
        .and_then(|v| v.as_i64())
        .ok_or_else(|| "Missing field: targetValue".to_string())?;
    let period_start = as_str_or_num(goal.get("periodStart"))
        .ok_or_else(|| "Missing field: periodStart".to_string())?;
    let period_end = as_str_or_num(goal.get("periodEnd"))
        .ok_or_else(|| "Missing field: periodEnd".to_string())?;
    let achieved_at = as_str_or_num(goal.get("achievedAt"));

    conn.execute(
        "INSERT OR REPLACE INTO timer_goals
         (id, goal_type, target_value, period_start, period_end, achieved_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, goal_type, target_value, period_start, period_end, achieved_at],
    )
    .map_err(|e| format!("save_timer_goal: {e}"))?;

    Ok(id)
}
