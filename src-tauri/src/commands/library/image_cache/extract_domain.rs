use url::Url;

/// Extract just the host of a URL (e.g. `upload.wikimedia.org` from
/// `https://upload.wikimedia.org/wikipedia/commons/x.jpg`). Returns the raw
/// input if parsing fails so we never lose the source completely.
pub fn extract_domain(url: &str) -> String {
    Url::parse(url)
        .ok()
        .and_then(|u| u.host_str().map(|h| h.to_string()))
        .unwrap_or_else(|| url.to_string())
}
