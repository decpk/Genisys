use super::absolutize_url::absolutize_url;
use super::link_metadata::LinkMetadata;
use scraper::{Html, Selector};
use url::Url;

/// Extract link-preview metadata from a parsed HTML document. All URLs are
/// absolutized against `final_url` (the URL after redirects).
pub fn extract_link_metadata(document: &Html, final_url: &str) -> LinkMetadata {
    // Title: og:title, else <title>.
    let title = meta_content(document, r#"meta[property="og:title"]"#)
        .filter(|s| !s.is_empty())
        .or_else(|| {
            Selector::parse("title").ok().and_then(|sel| {
                document
                    .select(&sel)
                    .next()
                    .map(|el| el.text().collect::<String>().trim().to_string())
            })
        })
        .unwrap_or_default();

    // Description: og:description, else meta[name=description].
    let description = meta_content(document, r#"meta[property="og:description"]"#)
        .filter(|s| !s.is_empty())
        .or_else(|| meta_content(document, r#"meta[name="description"]"#))
        .unwrap_or_default();

    // siteName: og:site_name, else the host of final_url.
    let host = Url::parse(final_url)
        .ok()
        .and_then(|u| u.host_str().map(str::to_string))
        .unwrap_or_default();
    let site_name = meta_content(document, r#"meta[property="og:site_name"]"#)
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| host.clone());

    // Favicon: <link rel="icon"|"shortcut icon"|"apple-touch-icon">, else /favicon.ico.
    let favicon_href = link_href(document, r#"link[rel="icon"]"#)
        .or_else(|| link_href(document, r#"link[rel="shortcut icon"]"#))
        .or_else(|| link_href(document, r#"link[rel="apple-touch-icon"]"#));
    let favicon_url = match favicon_href {
        Some(href) if !href.is_empty() => absolutize_url(final_url, &href),
        _ => Url::parse(final_url)
            .ok()
            .map(|u| format!("{}://{}/favicon.ico", u.scheme(), u.host_str().unwrap_or("")))
            .unwrap_or_default(),
    };

    // Image: og:image, else twitter:image — absolutized.
    let image_raw = meta_content(document, r#"meta[property="og:image"]"#)
        .filter(|s| !s.is_empty())
        .or_else(|| meta_content(document, r#"meta[name="twitter:image"]"#))
        .unwrap_or_default();
    let image_url = if image_raw.is_empty() {
        String::new()
    } else {
        absolutize_url(final_url, &image_raw)
    };

    // Theme color.
    let theme_color = meta_content(document, r#"meta[name="theme-color"]"#).unwrap_or_default();

    LinkMetadata {
        title,
        description,
        site_name,
        favicon_url,
        image_url,
        theme_color,
    }
}

/// Read the trimmed `content` attribute of the first element matching `selector`.
fn meta_content(document: &Html, selector: &str) -> Option<String> {
    let sel = Selector::parse(selector).ok()?;
    document
        .select(&sel)
        .next()
        .and_then(|el| el.value().attr("content"))
        .map(|s| s.trim().to_string())
}

/// Read the trimmed `href` attribute of the first element matching `selector`.
fn link_href(document: &Html, selector: &str) -> Option<String> {
    let sel = Selector::parse(selector).ok()?;
    document
        .select(&sel)
        .next()
        .and_then(|el| el.value().attr("href"))
        .map(|s| s.trim().to_string())
}
