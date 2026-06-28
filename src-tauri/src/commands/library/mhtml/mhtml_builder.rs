use reqwest::blocking::Client;
use scraper::{Html, Selector};
use url::Url;

use super::http_client::build_http_client;
use super::resource_fetcher::fetch_resource;

/// Build a complete MHTML document from a URL.
///
/// Fetches the main HTML page, discovers all sub-resources (CSS, images),
/// fetches each one, and assembles them into a single MHTML multipart archive.
/// Scripts are stripped for security.
pub fn build_mhtml(url: &str) -> Result<(String, Vec<u8>), String> {
    let parsed_url = Url::parse(url).map_err(|e| format!("Invalid URL: {e}"))?;
    let client = build_http_client(&parsed_url)?;

    // Fetch main HTML
    let html_text = fetch_main_page(&client, &parsed_url, url)?;
    let document = Html::parse_document(&html_text);

    // Extract page title
    let title = extract_title(&document);

    // Discover sub-resources (CSS, images)
    let resource_urls = discover_resources(&document, &parsed_url);

    // Fetch all sub-resources
    let mut parts: Vec<MhtmlPart> = Vec::new();
    let mut seen_urls: std::collections::HashSet<String> = resource_urls.iter().cloned().collect();

    for res_url in &resource_urls {
        match fetch_resource(&client, res_url) {
            Ok(part) => {
                // If this is a CSS file, parse it for font/image URLs
                if part.content_type.contains("text/css") {
                    if let Ok(css_text) = std::str::from_utf8(&part.data) {
                        let css_base = Url::parse(res_url).unwrap_or(parsed_url.clone());
                        let sub_urls = extract_css_urls(css_text, &css_base);
                        for sub_url in sub_urls {
                            if seen_urls.insert(sub_url.clone()) {
                                match fetch_resource(&client, &sub_url) {
                                    Ok(sub_part) => parts.push(sub_part),
                                    Err(e) => eprintln!("[mhtml] Skipping CSS sub-resource {sub_url}: {e}"),
                                }
                            }
                        }
                    }
                }
                parts.push(part);
            }
            Err(e) => eprintln!("[mhtml] Skipping resource {res_url}: {e}"),
        }
    }

    // Strip scripts from HTML for security
    let clean_html = strip_scripts(&html_text);

    // Assemble MHTML
    let mhtml = assemble_mhtml(url, &clean_html, &parts);

    Ok((title, mhtml.into_bytes()))
}

pub struct MhtmlPart {
    pub content_type: String,
    pub content_location: String,
    pub data: Vec<u8>,
}

fn fetch_main_page(client: &Client, parsed_url: &Url, url: &str) -> Result<String, String> {
    // Cookie warm-up: hit root domain first
    let root_url = format!(
        "{}://{}",
        parsed_url.scheme(),
        parsed_url.host_str().unwrap_or("")
    );
    let _ = client.get(&root_url).send();

    let resp = client
        .get(url)
        .send()
        .map_err(|e| format!("Failed to fetch page: {e}"))?;

    if !resp.status().is_success() {
        return Err(format!("HTTP {}", resp.status()));
    }

    resp.text()
        .map_err(|e| format!("Failed to read response body: {e}"))
}

fn extract_title(document: &Html) -> String {
    let sel = Selector::parse("title").unwrap();
    document
        .select(&sel)
        .next()
        .map(|el| el.text().collect::<String>().trim().to_string())
        .unwrap_or_default()
}

fn discover_resources(document: &Html, base_url: &Url) -> Vec<String> {
    let mut urls: Vec<String> = Vec::new();
    let mut seen = std::collections::HashSet::new();

    // CSS stylesheets
    if let Ok(sel) = Selector::parse("link[rel='stylesheet'][href]") {
        for el in document.select(&sel) {
            if let Some(href) = el.value().attr("href") {
                if let Some(resolved) = resolve_url(base_url, href) {
                    if seen.insert(resolved.clone()) {
                        urls.push(resolved);
                    }
                }
            }
        }
    }

    // Images
    if let Ok(sel) = Selector::parse("img[src]") {
        for el in document.select(&sel) {
            if let Some(src) = el.value().attr("src") {
                if src.starts_with("data:") {
                    continue;
                }
                if let Some(resolved) = resolve_url(base_url, src) {
                    if seen.insert(resolved.clone()) {
                        urls.push(resolved);
                    }
                }
            }
        }
    }

    // Favicons and icons
    if let Ok(sel) = Selector::parse("link[rel='icon'][href], link[rel='shortcut icon'][href], link[rel='apple-touch-icon'][href]") {
        for el in document.select(&sel) {
            if let Some(href) = el.value().attr("href") {
                if let Some(resolved) = resolve_url(base_url, href) {
                    if seen.insert(resolved.clone()) {
                        urls.push(resolved);
                    }
                }
            }
        }
    }

    // Preloaded fonts
    if let Ok(sel) = Selector::parse("link[rel='preload'][as='font'][href]") {
        for el in document.select(&sel) {
            if let Some(href) = el.value().attr("href") {
                if let Some(resolved) = resolve_url(base_url, href) {
                    if seen.insert(resolved.clone()) {
                        urls.push(resolved);
                    }
                }
            }
        }
    }

    // Inline style background images
    if let Ok(sel) = Selector::parse("[style]") {
        for el in document.select(&sel) {
            if let Some(style) = el.value().attr("style") {
                for css_url in extract_css_urls(style, base_url) {
                    if seen.insert(css_url.clone()) {
                        urls.push(css_url);
                    }
                }
            }
        }
    }

    urls
}

fn resolve_url(base: &Url, href: &str) -> Option<String> {
    if href.starts_with("data:") || href.starts_with("javascript:") {
        return None;
    }
    match Url::parse(href) {
        Ok(u) => Some(u.to_string()),
        Err(_) => base.join(href).ok().map(|u| u.to_string()),
    }
}

/// Extract `url(...)` references from CSS text (fonts, background images).
fn extract_css_urls(css_text: &str, base_url: &Url) -> Vec<String> {
    let re = regex::Regex::new(r#"url\(\s*['"]?([^'"\)\s]+)['"]?\s*\)"#)
        .unwrap_or_else(|_| return regex::Regex::new(r"$^").unwrap());

    let mut urls = Vec::new();
    for cap in re.captures_iter(css_text) {
        let raw = &cap[1];
        if raw.starts_with("data:") {
            continue;
        }
        if let Some(resolved) = resolve_url(base_url, raw) {
            urls.push(resolved);
        }
    }
    urls
}

fn strip_scripts(html: &str) -> String {
    // Remove <script>...</script> tags and their content
    let re = regex::Regex::new(r"(?is)<script[^>]*>.*?</script>").unwrap_or_else(|_| {
        regex::Regex::new(r"<script").unwrap()
    });
    let cleaned = re.replace_all(html, "");

    // Remove inline event handlers (onclick, onload, etc.)
    let event_re = regex::Regex::new(r#"(?i)\s+on\w+\s*=\s*"[^"]*""#).unwrap_or_else(|_| {
        regex::Regex::new(r"onerror").unwrap()
    });
    event_re.replace_all(&cleaned, "").to_string()
}

fn assemble_mhtml(page_url: &str, html: &str, parts: &[MhtmlPart]) -> String {
    let boundary = "----=_NextPart_Genisys_MHTML_Boundary";

    let mut mhtml = String::new();

    // MHTML header
    mhtml.push_str("From: <Saved by Genisys>\r\n");
    mhtml.push_str(&format!("Subject: Saved Webpage\r\n"));
    mhtml.push_str("MIME-Version: 1.0\r\n");
    mhtml.push_str(&format!(
        "Content-Type: multipart/related; boundary=\"{boundary}\"\r\n"
    ));
    mhtml.push_str("\r\n");

    // Main HTML part
    mhtml.push_str(&format!("--{boundary}\r\n"));
    mhtml.push_str("Content-Type: text/html; charset=utf-8\r\n");
    mhtml.push_str("Content-Transfer-Encoding: quoted-printable\r\n");
    mhtml.push_str(&format!("Content-Location: {page_url}\r\n"));
    mhtml.push_str("\r\n");
    mhtml.push_str(&quoted_printable_encode(html));
    mhtml.push_str("\r\n");

    // Sub-resource parts
    for part in parts {
        mhtml.push_str(&format!("--{boundary}\r\n"));
        mhtml.push_str(&format!("Content-Type: {}\r\n", part.content_type));
        mhtml.push_str("Content-Transfer-Encoding: base64\r\n");
        mhtml.push_str(&format!("Content-Location: {}\r\n", part.content_location));
        mhtml.push_str("\r\n");

        let b64 = base64::Engine::encode(
            &base64::engine::general_purpose::STANDARD,
            &part.data,
        );
        // Line-wrap base64 at 76 chars per RFC 2045
        for chunk in b64.as_bytes().chunks(76) {
            mhtml.push_str(std::str::from_utf8(chunk).unwrap_or(""));
            mhtml.push_str("\r\n");
        }
    }

    // Final boundary
    mhtml.push_str(&format!("--{boundary}--\r\n"));

    mhtml
}

fn quoted_printable_encode(input: &str) -> String {
    let mut result = String::new();
    let mut line_len = 0;

    for byte in input.bytes() {
        let encoded = if byte == b'\r' || byte == b'\n' {
            line_len = 0;
            String::from(byte as char)
        } else if byte == b'\t' || (byte >= 0x20 && byte <= 0x7E && byte != b'=') {
            format!("{}", byte as char)
        } else {
            format!("={:02X}", byte)
        };

        if line_len + encoded.len() > 75 {
            result.push_str("=\r\n");
            line_len = 0;
        }

        line_len += encoded.len();
        result.push_str(&encoded);
    }

    result
}
