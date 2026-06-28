use serde_json::Value;

use crate::commands::err_val;
use crate::commands::stocks::yahoo_client::build_yahoo_client;
use crate::types::StockSearchResult;

fn do_search(query: &str) -> Result<Vec<StockSearchResult>, String> {
    let client = build_yahoo_client()?;
    let url = "https://query1.finance.yahoo.com/v1/finance/search";
    let resp = client
        .get(url)
        .query(&[
            ("q", query),
            ("quotesCount", "10"),
            ("newsCount", "0"),
            ("listsCount", "0"),
            ("enableFuzzyQuery", "false"),
            ("enableEnhancedTrivialQuery", "true"),
        ])
        .send()
        .map_err(|e: reqwest::Error| e.to_string())?;
    if !resp.status().is_success() {
        return Err(format!("HTTP {}", resp.status()));
    }
    let body: Value = resp.json().map_err(|e: reqwest::Error| e.to_string())?;

    let quotes = body.get("quotes").and_then(|v| v.as_array());
    let mut out: Vec<StockSearchResult> = Vec::new();
    if let Some(arr) = quotes {
        for q in arr {
            let symbol = q
                .get("symbol")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            if symbol.is_empty() {
                continue;
            }
            let quote_type = q
                .get("quoteType")
                .and_then(|v| v.as_str())
                .unwrap_or("EQUITY")
                .to_string();
            // Allow equities, ETFs, indices, crypto, currencies, mutual funds.
            let allowed = matches!(
                quote_type.as_str(),
                "EQUITY" | "ETF" | "INDEX" | "CRYPTOCURRENCY" | "CURRENCY" | "MUTUALFUND" | "FUTURE"
            );
            if !allowed {
                continue;
            }
            out.push(StockSearchResult {
                symbol,
                short_name: q
                    .get("shortname")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string(),
                long_name: q
                    .get("longname")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string(),
                exchange: q
                    .get("exchDisp")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string(),
                quote_type,
            });
        }
    }
    Ok(out)
}

#[tauri::command]
pub async fn cmd_stocks_search(query: String) -> Value {
    let trimmed = query.trim().to_string();
    if trimmed.is_empty() {
        return serde_json::json!({ "success": true, "results": [] });
    }
    match tokio::task::spawn_blocking(move || do_search(&trimmed)).await {
        Ok(Ok(results)) => serde_json::json!({ "success": true, "results": results }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
