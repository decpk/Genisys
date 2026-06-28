use regex::Regex;

/// Extract every external image URL (`http://` or `https://`) referenced by a
/// markdown `![alt](url)` directive. Returns URLs in document order with
/// duplicates removed (first occurrence wins).
pub fn extract_image_urls(markdown: &str) -> Vec<String> {
    // ![alt text](url "optional title") — alt may contain ] when escaped, but
    // the AI never escapes so we keep it simple.
    let re = Regex::new(r#"!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)"#).unwrap();
    let mut out: Vec<String> = Vec::new();
    for caps in re.captures_iter(markdown) {
        let raw = caps.get(1).map(|m| m.as_str().trim()).unwrap_or("");
        if raw.is_empty() {
            continue;
        }
        if !(raw.starts_with("http://") || raw.starts_with("https://")) {
            continue;
        }
        let url = raw.to_string();
        if !out.iter().any(|u| u == &url) {
            out.push(url);
        }
    }
    out
}
