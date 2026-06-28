use crate::commands::{err_val, run_git};
use serde_json::Value;
use std::collections::HashMap;

/// Returns commit-count-per-day for a single calendar year, plus the earliest
/// year with any commits (so the frontend can populate a year dropdown without
/// a second call). Only days with count > 0 are returned to keep the payload
/// small.
#[tauri::command]
pub async fn cmd_get_git_commit_calendar(root_path: String, year: i32) -> Value {
    match tokio::task::spawn_blocking(move || -> Result<Value, String> {
        let since = format!("{year}-01-01T00:00:00");
        let until = format!("{year}-12-31T23:59:59");

        let out = run_git(
            &root_path,
            &[
                "log",
                "--no-merges",
                "--all",
                "--pretty=format:%aI",
                &format!("--since={since}"),
                &format!("--until={until}"),
            ],
        )?;

        let mut buckets: HashMap<String, u32> = HashMap::new();
        for line in out.lines() {
            // %aI looks like "2025-03-14T09:21:55+05:30" — take the first 10 chars.
            if line.len() >= 10 {
                let date = &line[..10];
                *buckets.entry(date.to_string()).or_insert(0) += 1;
            }
        }

        // Resolve the earliest commit year (across all branches) once so the
        // dropdown can list every selectable year without an extra round trip.
        let earliest = run_git(
            &root_path,
            &[
                "log",
                "--all",
                "--no-merges",
                "--reverse",
                "--max-count=1",
                "--pretty=format:%aI",
            ],
        )
        .ok()
        .and_then(|s| {
            let trimmed = s.trim();
            if trimmed.len() >= 4 {
                trimmed[..4].parse::<i32>().ok()
            } else {
                None
            }
        });

        let mut days: Vec<Value> = buckets
            .into_iter()
            .map(|(date, count)| serde_json::json!({"date": date, "count": count}))
            .collect();
        days.sort_by(|a, b| a["date"].as_str().cmp(&b["date"].as_str()));

        let total: u32 = days.iter().map(|d| d["count"].as_u64().unwrap_or(0) as u32).sum();

        Ok(serde_json::json!({
            "year": year,
            "days": days,
            "total": total,
            "earliestYear": earliest,
        }))
    })
    .await
    {
        Ok(Ok(data)) => serde_json::json!({"success": true, "data": data}),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
