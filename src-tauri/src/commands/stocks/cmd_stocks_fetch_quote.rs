use chrono::Utc;
use serde_json::Value;
use tauri::State;

use crate::commands::stocks::yahoo_client::build_yahoo_client;
use crate::commands::{err_val, AppState};
use crate::database::{load_stocks_quote_cache_db, save_stocks_quote_cache_db};
use crate::types::StockQuote;

/// Yahoo `chart` endpoint returns the latest meta fields we need for a quote.
/// We hit the smallest possible range (1d / 5m) to minimise payload size.
fn fetch_quote(symbol: &str) -> Result<StockQuote, String> {
    let client = build_yahoo_client()?;
    let url = format!(
        "https://query1.finance.yahoo.com/v8/finance/chart/{}",
        symbol
    );
    let resp = client
        .get(&url)
        .query(&[
            ("range", "1d"),
            ("interval", "5m"),
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
    let meta = result
        .get("meta")
        .ok_or_else(|| "No meta in chart result".to_string())?;

    let price = meta
        .get("regularMarketPrice")
        .and_then(|v| v.as_f64())
        .ok_or_else(|| "No regularMarketPrice".to_string())?;
    let prev_close = meta
        .get("chartPreviousClose")
        .and_then(|v| v.as_f64())
        .or_else(|| meta.get("previousClose").and_then(|v| v.as_f64()))
        .unwrap_or(price);
    let change_pct = if prev_close.abs() > f64::EPSILON {
        ((price - prev_close) / prev_close) * 100.0
    } else {
        0.0
    };

    Ok(StockQuote {
        symbol: meta
            .get("symbol")
            .and_then(|v| v.as_str())
            .unwrap_or(symbol)
            .to_string(),
        price,
        prev_close,
        change_pct,
        day_high: meta.get("regularMarketDayHigh").and_then(|v| v.as_f64()),
        day_low: meta.get("regularMarketDayLow").and_then(|v| v.as_f64()),
        day_open: meta.get("regularMarketOpen").and_then(|v| v.as_f64()),
        volume: meta.get("regularMarketVolume").and_then(|v| v.as_i64()),
        fifty_two_week_high: meta.get("fiftyTwoWeekHigh").and_then(|v| v.as_f64()),
        fifty_two_week_low: meta.get("fiftyTwoWeekLow").and_then(|v| v.as_f64()),
        currency: meta
            .get("currency")
            .and_then(|v| v.as_str())
            .unwrap_or("USD")
            .to_string(),
        market_state: meta
            .get("marketState")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        fetched_at: Utc::now().to_rfc3339(),
    })
}

/// 2-minute TTL for quote cache when caller is not forcing a refresh.
const QUOTE_TTL_SECS: i64 = 120;

#[tauri::command]
pub async fn cmd_stocks_fetch_quote(
    state: State<'_, AppState>,
    symbol: String,
    force: Option<bool>,
) -> Result<Value, String> {
    let force_refresh = force.unwrap_or(false);
    let sym = symbol.trim().to_uppercase();
    if sym.is_empty() {
        return Ok(err_val("Empty symbol"));
    }

    // Cache hit?
    if !force_refresh {
        if let Some(cached) = load_stocks_quote_cache_db(&state.db, &sym) {
            if let Ok(then) = chrono::DateTime::parse_from_rfc3339(&cached.fetched_at) {
                let age = Utc::now().timestamp() - then.timestamp();
                if age < QUOTE_TTL_SECS {
                    return Ok(serde_json::json!({ "success": true, "quote": cached, "cached": true }));
                }
            }
        }
    }

    let sym_for_task = sym.clone();
    let fetched = tokio::task::spawn_blocking(move || fetch_quote(&sym_for_task)).await;
    match fetched {
        Ok(Ok(quote)) => {
            save_stocks_quote_cache_db(&state.db, &quote);
            Ok(serde_json::json!({ "success": true, "quote": quote, "cached": false }))
        }
        Ok(Err(e)) => {
            // Fall back to stale cache if available.
            if let Some(cached) = load_stocks_quote_cache_db(&state.db, &sym) {
                Ok(serde_json::json!({ "success": true, "quote": cached, "cached": true, "stale": true, "error": e }))
            } else {
                Ok(err_val(e))
            }
        }
        Err(e) => Ok(err_val(e)),
    }
}
