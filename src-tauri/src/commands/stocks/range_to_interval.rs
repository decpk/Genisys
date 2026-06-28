/// Map a user-facing range key to the Yahoo `interval` parameter.
///
/// Yahoo's `/v8/finance/chart/{symbol}` endpoint rejects mismatched
/// range/interval combinations, so we lock the mapping here:
///
///   1d  → 5m
///   7d  → 30m
///   14d → 1h
///   1m  → 1d
///   1y  → 1d
///   max → 1wk
pub fn range_to_interval(range: &str) -> &'static str {
    match range {
        "1d" => "5m",
        "7d" => "30m",
        "14d" => "1h",
        "1m" => "1d",
        "1y" => "1d",
        "max" => "1wk",
        _ => "1d",
    }
}

/// Map the user-facing range key to the literal `range` query value Yahoo
/// understands. We expose `7d`, `14d` etc. but Yahoo uses `5d` / `1mo` etc.
pub fn yahoo_range(range: &str) -> &'static str {
    match range {
        "1d" => "1d",
        "7d" => "5d",
        "14d" => "1mo",
        "1m" => "1mo",
        "1y" => "1y",
        "max" => "max",
        _ => "1y",
    }
}
