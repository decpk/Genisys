use regex::Regex;
use std::sync::OnceLock;

fn url_regex() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(r#"(?i)(https?://[^\s<>"']+|www\.[^\s<>"']+)"#).unwrap()
    })
}

/// Strip trailing sentence punctuation and unmatched closing brackets, mirroring
/// `stripTrailingNoise` in the frontend tokenizer.
fn strip_trailing_noise(raw: &str) -> String {
    let mut url = raw.to_string();
    loop {
        let trimmed = url
            .trim_end_matches(|c: char| matches!(c, '.' | ',' | ';' | ':' | '!' | '?'))
            .to_string();
        if trimmed != url {
            url = trimmed;
            continue;
        }
        let last = match url.chars().last() {
            Some(c) => c,
            None => break,
        };
        let open = match last {
            ')' => '(',
            ']' => '[',
            '}' => '{',
            _ => break,
        };
        let opens = url.matches(open).count();
        let closes = url.matches(last).count();
        if closes > opens {
            url.pop();
            continue;
        }
        break;
    }
    url
}

/// Extract every http(s)/www URL from `text`, in document order, de-duplicated
/// (first occurrence wins). Bare `www.` URLs are normalized with `http://`.
pub fn extract_urls(text: &str) -> Vec<String> {
    let mut out: Vec<String> = Vec::new();
    for m in url_regex().find_iter(text) {
        let cleaned = strip_trailing_noise(m.as_str());
        if cleaned.is_empty() {
            continue;
        }
        let normalized = if cleaned.starts_with("www.") {
            format!("http://{cleaned}")
        } else {
            cleaned
        };
        if !out.iter().any(|u| u == &normalized) {
            out.push(normalized);
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_dedupes_and_normalizes() {
        let text = "see https://a.com and (https://b.com). also https://a.com www.c.com!";
        assert_eq!(
            extract_urls(text),
            vec![
                "https://a.com".to_string(),
                "https://b.com".to_string(),
                "http://www.c.com".to_string(),
            ]
        );
    }
}
