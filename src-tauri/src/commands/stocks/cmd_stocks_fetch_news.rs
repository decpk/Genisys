use chrono::{TimeZone, Utc};
use serde_json::Value;

use crate::commands::err_val;
use crate::commands::stocks::yahoo_client::build_yahoo_client;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct YahooNewsItem {
    title: String,
    summary: String,
    url: String,
    publisher: String,
    published_at: Option<String>,
    related_tickers: Vec<String>,
}

/// Yahoo's `/v1/finance/search` endpoint returns sector/industry-tagged news
/// that often has nothing to do with the queried ticker. We over-fetch and
/// then keep only items whose `relatedTickers` array contains the symbol
/// (or whose title explicitly mentions it). This is the standard fix used
/// by every well-behaved Yahoo client.
fn fetch_news(symbol: &str, count: u32) -> Result<Vec<YahooNewsItem>, String> {
    let client = build_yahoo_client()?;
    // Over-fetch because filtering can be aggressive. Cap at 50 (Yahoo limit).
    let over_fetch = (count.saturating_mul(4)).max(30).min(50);
    let count_str = over_fetch.to_string();
    let url = "https://query1.finance.yahoo.com/v1/finance/search";
    let resp = client
        .get(url)
        .query(&[
            ("q", symbol),
            ("quotesCount", "0"),
            ("newsCount", count_str.as_str()),
            ("listsCount", "0"),
            ("enableFuzzyQuery", "false"),
        ])
        .send()
        .map_err(|e: reqwest::Error| e.to_string())?;
    if !resp.status().is_success() {
        return Err(format!("HTTP {}", resp.status()));
    }
    let body: Value = resp.json().map_err(|e: reqwest::Error| e.to_string())?;
    let news = body.get("news").and_then(|v| v.as_array());

    let symbol_upper = symbol.to_uppercase();
    // Allow the "base" of dotted tickers (e.g. "TATAELXSI.NS" → "TATAELXSI")
    // so an item that only lists the un-suffixed form still matches.
    let symbol_base = symbol_upper
        .split('.')
        .next()
        .unwrap_or(&symbol_upper)
        .to_string();

    let mut strict: Vec<YahooNewsItem> = Vec::new();
    let mut loose: Vec<YahooNewsItem> = Vec::new();

    if let Some(arr) = news {
        for n in arr {
            let title = n
                .get("title")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            if title.is_empty() {
                continue;
            }
            let link = n
                .get("link")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            let publisher = n
                .get("publisher")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            let ts = n.get("providerPublishTime").and_then(|v| v.as_i64());
            let published_at = ts
                .and_then(|secs| Utc.timestamp_opt(secs, 0).single())
                .map(|dt| dt.to_rfc3339());

            // Parse `relatedTickers` (array of strings).
            let related_tickers: Vec<String> = n
                .get("relatedTickers")
                .and_then(|v| v.as_array())
                .map(|arr| {
                    arr.iter()
                        .filter_map(|t| t.as_str().map(|s| s.to_uppercase()))
                        .collect()
                })
                .unwrap_or_default();

            // STRICT match: relatedTickers contains the symbol (or its base).
            let in_related = related_tickers
                .iter()
                .any(|t| t == &symbol_upper || t == &symbol_base);
            // LOOSE fallback: the title mentions the symbol (uppercase, word-ish).
            let title_upper = title.to_uppercase();
            let in_title = title_upper.contains(&symbol_upper)
                || (symbol_base != symbol_upper && title_upper.contains(&symbol_base));

            let item = YahooNewsItem {
                title,
                summary: String::new(),
                url: link,
                publisher,
                published_at,
                related_tickers,
            };

            if in_related {
                strict.push(item);
            } else if in_title {
                loose.push(item);
            }
            // Otherwise: drop (sector-wide noise).
        }
    }

    // Prefer strict matches; top them up with loose matches if we don't have enough.
    let want = count as usize;
    let mut out = strict;
    if out.len() < want {
        let need = want - out.len();
        out.extend(loose.into_iter().take(need));
    }
    out.truncate(want);
    Ok(out)
}

#[tauri::command]
pub async fn cmd_stocks_fetch_news(symbol: String, count: Option<u32>) -> Value {
    let sym = symbol.trim().to_uppercase();
    if sym.is_empty() {
        return serde_json::json!({ "success": true, "items": [] });
    }
    let n = count.unwrap_or(15).clamp(1, 50);
    match tokio::task::spawn_blocking(move || fetch_news(&sym, n)).await {
        Ok(Ok(items)) => serde_json::json!({ "success": true, "items": items }),
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}
