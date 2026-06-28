use crate::commands::err_val;
use serde_json::Value;
use url::Url;

/// Reusable synchronous crawl function.
/// Call from within `spawn_blocking` or any blocking context.
pub fn crawl_url(url: &str) -> Result<Value, String> {
    let parsed_url = Url::parse(url).map_err(|e| format!("Invalid URL: {e}"))?;
    let base_domain = parsed_url.host_str().unwrap_or("").to_string();

    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(reqwest::header::ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8".parse().unwrap());
    headers.insert(reqwest::header::ACCEPT_LANGUAGE, "en-US,en;q=0.9".parse().unwrap());
    headers.insert(reqwest::header::ACCEPT_ENCODING, "gzip, deflate, br".parse().unwrap());
    headers.insert(reqwest::header::CONNECTION, "keep-alive".parse().unwrap());
    headers.insert("Sec-Fetch-Dest", "document".parse().unwrap());
    headers.insert("Sec-Fetch-Mode", "navigate".parse().unwrap());
    headers.insert("Sec-Fetch-Site", "none".parse().unwrap());
    headers.insert("Sec-Fetch-User", "?1".parse().unwrap());
    headers.insert("Sec-CH-UA", r#""Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99""#.parse().unwrap());
    headers.insert("Sec-CH-UA-Mobile", "?0".parse().unwrap());
    headers.insert("Sec-CH-UA-Platform", r#""macOS""#.parse().unwrap());
    headers.insert(reqwest::header::UPGRADE_INSECURE_REQUESTS, "1".parse().unwrap());
    headers.insert(reqwest::header::CACHE_CONTROL, "max-age=0".parse().unwrap());

    let client = reqwest::blocking::Client::builder()
        .user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
        .default_headers(headers)
        .timeout(std::time::Duration::from_secs(30))
        .redirect(reqwest::redirect::Policy::limited(10))
        .cookie_store(true)
        .gzip(true)
        .brotli(true)
        .deflate(true)
        .build()
        .map_err(|e: reqwest::Error| e.to_string())?;

    // First hit the root domain to establish cookies (many sites require this)
    let root_url = format!("{}://{}", parsed_url.scheme(), parsed_url.host_str().unwrap_or(""));
    let _ = client.get(&root_url).send();

    let resp = client.get(url).send().map_err(|e: reqwest::Error| e.to_string())?;

    if !resp.status().is_success() {
        return Err(format!("HTTP {}", resp.status()));
    }

    let html = resp.text().map_err(|e: reqwest::Error| e.to_string())?;
    let document = scraper::Html::parse_document(&html);

    // ── Extract title ──────────────────────────────────────────
    let title = document
        .select(&scraper::Selector::parse("title").unwrap())
        .next()
        .map(|el| el.text().collect::<String>().trim().to_string())
        .unwrap_or_default();

    // ── Extract meta description ───────────────────────────────
    let description = document
        .select(&scraper::Selector::parse(r#"meta[name="description"]"#).unwrap())
        .next()
        .and_then(|el| el.value().attr("content"))
        .map(|s| s.trim().to_string())
        .unwrap_or_default();

    // ── Extract main text content ──────────────────────────────
    let skip_tags: std::collections::HashSet<&str> =
        ["script", "style", "nav", "footer", "noscript", "svg", "iframe"].into();

    let mut text_parts: Vec<String> = Vec::new();
    extract_text(&document.root_element(), &skip_tags, &mut text_parts);

    let raw_text = text_parts.join("\n");
    let content = collapse_whitespace(&raw_text);

    let content = if content.len() > 150_000 {
        let truncated = &content[..150_000];
        format!("{truncated}\n\n[Content truncated — page was very large]")
    } else {
        content
    };

    // ── Collect links ──────────────────────────────────────────
    let link_selector = scraper::Selector::parse("a[href]").unwrap();
    let mut internal_links: Vec<Value> = Vec::new();
    let mut external_links: Vec<Value> = Vec::new();
    let mut seen_hrefs: std::collections::HashSet<String> = std::collections::HashSet::new();

    for el in document.select(&link_selector) {
        let href_raw = el.value().attr("href").unwrap_or("").trim();
        if href_raw.is_empty()
            || href_raw.starts_with('#')
            || href_raw.starts_with("javascript:")
            || href_raw.starts_with("mailto:")
        {
            continue;
        }

        let resolved = match Url::parse(href_raw) {
            Ok(u) => u.to_string(),
            Err(_) => match parsed_url.join(href_raw) {
                Ok(u) => u.to_string(),
                Err(_) => continue,
            },
        };

        if !seen_hrefs.insert(resolved.clone()) {
            continue;
        }

        let link_text = el
            .text()
            .collect::<String>()
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" ");
        let link_text = if link_text.is_empty() {
            href_raw.to_string()
        } else {
            link_text
        };

        let entry = serde_json::json!({ "text": link_text, "href": resolved });

        if let Ok(link_url) = Url::parse(&resolved) {
            let link_domain = link_url.host_str().unwrap_or("");
            if link_domain == base_domain
                || link_domain.ends_with(&format!(".{base_domain}"))
            {
                internal_links.push(entry);
            } else {
                external_links.push(entry);
            }
        } else {
            internal_links.push(entry);
        }
    }

    Ok(serde_json::json!({
        "success": true,
        "url": url,
        "title": title,
        "description": description,
        "content": content,
        "internalLinks": internal_links,
        "externalLinks": external_links,
    }))
}

#[tauri::command]
pub async fn cmd_crawl_webpage(url: String) -> Value {
    match tokio::task::spawn_blocking(move || crawl_url(&url)).await {
        Ok(Ok(result)) => result,
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}

/// Lightweight crawl optimised for live-score pages.
///
/// Differences from `crawl_url`:
/// - Skips the root-domain cookie warm-up request (saves ~1 s).
/// - Strips more boilerplate HTML tags (header, aside, form, banner, ads …).
/// - Does NOT collect links (internal or external).
/// - Caps extracted text at 20 KB instead of 150 KB → less data for the LLM.
/// - Uses a shorter HTTP timeout (12 s vs 30 s).
pub fn crawl_url_lite(url: &str) -> Result<Value, String> {
    // Validate URL but don't need parsed_url (no link collection in lite mode)
    let _ = Url::parse(url).map_err(|e| format!("Invalid URL: {e}"))?;

    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(reqwest::header::ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8".parse().unwrap());
    headers.insert(reqwest::header::ACCEPT_LANGUAGE, "en-US,en;q=0.9".parse().unwrap());
    headers.insert(reqwest::header::ACCEPT_ENCODING, "gzip, deflate, br".parse().unwrap());
    headers.insert(reqwest::header::CONNECTION, "keep-alive".parse().unwrap());
    headers.insert(reqwest::header::CACHE_CONTROL, "no-cache".parse().unwrap());

    let client = reqwest::blocking::Client::builder()
        .user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
        .default_headers(headers)
        .timeout(std::time::Duration::from_secs(12))
        .redirect(reqwest::redirect::Policy::limited(5))
        .cookie_store(true)
        .gzip(true)
        .brotli(true)
        .deflate(true)
        .build()
        .map_err(|e: reqwest::Error| e.to_string())?;

    // Skip root-domain cookie hit — go straight to the target URL.
    let resp = client.get(url).send().map_err(|e: reqwest::Error| e.to_string())?;

    if !resp.status().is_success() {
        return Err(format!("HTTP {}", resp.status()));
    }

    let html = resp.text().map_err(|e: reqwest::Error| e.to_string())?;
    let document = scraper::Html::parse_document(&html);

    // ── Extract title ──────────────────────────────────────────
    let title = document
        .select(&scraper::Selector::parse("title").unwrap())
        .next()
        .map(|el| el.text().collect::<String>().trim().to_string())
        .unwrap_or_default();

    // ── Extract meta description ───────────────────────────────
    let description = document
        .select(&scraper::Selector::parse(r#"meta[name="description"]"#).unwrap())
        .next()
        .and_then(|el| el.value().attr("content"))
        .map(|s| s.trim().to_string())
        .unwrap_or_default();

    // ── Extract text — aggressive tag filtering ────────────────
    let skip_tags: std::collections::HashSet<&str> = [
        "script", "style", "nav", "footer", "noscript", "svg", "iframe",
        "header", "aside", "form", "button", "select", "option", "label",
        "img", "picture", "video", "audio", "canvas", "dialog", "menu",
        "template", "slot",
    ]
    .into();

    let mut text_parts: Vec<String> = Vec::new();
    extract_text(&document.root_element(), &skip_tags, &mut text_parts);

    let raw_text = text_parts.join("\n");
    let content = collapse_whitespace(&raw_text);

    // Tight cap — 20 KB is plenty for score extraction
    let content = if content.len() > 20_000 {
        let truncated = &content[..20_000];
        format!("{truncated}\n\n[Truncated]")
    } else {
        content
    };

    Ok(serde_json::json!({
        "success": true,
        "url": url,
        "title": title,
        "description": description,
        "content": content,
    }))
}

#[tauri::command]
pub async fn cmd_crawl_webpage_lite(url: String) -> Value {
    match tokio::task::spawn_blocking(move || crawl_url_lite(&url)).await {
        Ok(Ok(result)) => result,
        Ok(Err(e)) => err_val(e),
        Err(e) => err_val(e),
    }
}

/// Recursively extract visible text from HTML nodes, skipping specified tags.
fn extract_text(
    node: &scraper::ElementRef,
    skip_tags: &std::collections::HashSet<&str>,
    out: &mut Vec<String>,
) {
    for child in node.children() {
        match child.value() {
            scraper::Node::Text(text) => {
                let t = text.trim();
                if !t.is_empty() {
                    out.push(t.to_string());
                }
            }
            scraper::Node::Element(el) => {
                if skip_tags.contains(el.name()) {
                    continue;
                }
                if let Some(child_ref) = scraper::ElementRef::wrap(child) {
                    // Add line break for block-level elements
                    let block_tags: &[&str] = &[
                        "div", "p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "tr", "br",
                        "section", "article", "main", "blockquote", "pre", "table", "ul", "ol",
                        "dt", "dd", "figcaption",
                    ];
                    if block_tags.contains(&el.name()) {
                        out.push(String::new());
                    }
                    extract_text(&child_ref, skip_tags, out);
                }
            }
            _ => {}
        }
    }
}

/// Collapse multiple blank lines into single blank lines and trim each line.
fn collapse_whitespace(input: &str) -> String {
    let mut result = String::with_capacity(input.len());
    let mut blank_count = 0u32;
    for line in input.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            blank_count += 1;
            if blank_count <= 1 {
                result.push('\n');
            }
        } else {
            blank_count = 0;
            if !result.is_empty() {
                result.push('\n');
            }
            result.push_str(trimmed);
        }
    }
    result
}
