use chrono::Utc;
use serde_json::Value;
use tauri::State;

use crate::commands::stocks::range_to_interval::{range_to_interval, yahoo_range};
use crate::commands::stocks::yahoo_client::build_yahoo_client;
use crate::commands::{err_val, AppState};
use crate::database::{load_stocks_history_cache_db, save_stocks_history_cache_db};
use crate::types::StockHistoryPoint;

fn fetch_history(symbol: &str, range: &str) -> Result<Vec<StockHistoryPoint>, String> {
    let client = build_yahoo_client()?;
    let url = format!(
        "https://query1.finance.yahoo.com/v8/finance/chart/{}",
        symbol
    );
    let resp = client
        .get(&url)
        .query(&[
            ("range", yahoo_range(range)),
            ("interval", range_to_interval(range)),
            ("includePrePost", "false"),
        ])
        .send()
        .map_err(|e: reqwest::Error| e.to_string())?;
    if !resp.status().is_success() {
        return Err(format!("HTTP {}", resp.status()));
    }
    let body: Value = resp.json().map_err(|e: reqwest::Error| e.to_string())?;
    let result = body
        .get("chart")
        .and_then(|c| c.get("result"))
        .and_then(|r| r.as_array())
        .and_then(|arr| arr.first())
        .ok_or_else(|| "No chart result".to_string())?;

    let timestamps = result
        .get("timestamp")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default();
    let closes = result
        .get("indicators")
        .and_then(|i| i.get("quote"))
        .and_then(|q| q.as_array())
        .and_then(|arr| arr.first())
        .and_then(|q| q.get("close"))
        .and_then(|c| c.as_array())
        .cloned()
        .unwrap_or_default();

    let mut points: Vec<StockHistoryPoint> = Vec::new();
    let len = timestamps.len().min(closes.len());
    for i in 0..len {
        let t = timestamps[i].as_i64().unwrap_or(0);
        let c = match closes[i].as_f64() {
            Some(c) => c,
            None => continue,
        };
        if t == 0 {
            continue;
        }
        points.push(StockHistoryPoint { t, c });
    }
    Ok(points)
}

/// Cache TTL per range — shorter ranges refresh more often.
fn ttl_secs_for_range(range: &str) -> i64 {
    match range {
        "1d" => 300,    // 5 minutes
        "7d" => 900,    // 15 minutes
        "14d" => 900,   // 15 minutes
        "1m" => 3600,   // 1 hour
        "1y" => 3600,   // 1 hour
        "max" => 86400, // 1 day
        _ => 1800,
    }
}

#[tauri::command]
pub async fn cmd_stocks_fetch_history(
    state: State<'_, AppState>,
    symbol: String,
    range: String,
    force: Option<bool>,
) -> Result<Value, String> {
    let force_refresh = force.unwrap_or(false);
    let sym = symbol.trim().to_uppercase();
    let rng = range.trim().to_string();
    if sym.is_empty() || rng.is_empty() {
        return Ok(err_val("Empty symbol or range"));
    }

    if !force_refresh {
        if let Some(cached) = load_stocks_history_cache_db(&state.db, &sym, &rng) {
            if let Ok(then) = chrono::DateTime::parse_from_rfc3339(&cached.fetched_at) {
                let age = Utc::now().timestamp() - then.timestamp();
                if age < ttl_secs_for_range(&rng) {
                    return Ok(serde_json::json!({
                        "success": true,
                        "symbol": sym,
                        "range": rng,
                        "points": cached.points,
                        "cached": true,
                    }));
                }
            }
        }
    }

    let sym_for_task = sym.clone();
    let rng_for_task = rng.clone();
    let fetched =
        tokio::task::spawn_blocking(move || fetch_history(&sym_for_task, &rng_for_task)).await;
    match fetched {
        Ok(Ok(points)) => {
            let now = Utc::now().to_rfc3339();
            save_stocks_history_cache_db(&state.db, &sym, &rng, &points, &now);
            Ok(serde_json::json!({
                "success": true,
                "symbol": sym,
                "range": rng,
                "points": points,
                "cached": false,
            }))
        }
        Ok(Err(e)) => {
            if let Some(cached) = load_stocks_history_cache_db(&state.db, &sym, &rng) {
                Ok(serde_json::json!({
                    "success": true,
                    "symbol": sym,
                    "range": rng,
                    "points": cached.points,
                    "cached": true,
                    "stale": true,
                    "error": e,
                }))
            } else {
                Ok(err_val(e))
            }
        }
        Err(e) => Ok(err_val(e)),
    }
}
