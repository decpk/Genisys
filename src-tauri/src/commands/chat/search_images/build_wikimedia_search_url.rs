//! Build the Wikimedia Commons search URL for a given query.
//!
//! Uses the `query` action with `generator=search`, restricted to file
//! namespace (6) and image media-type, so we get back only real images
//! (no audio/video/PDFs). Also asks for `imageinfo` with extmetadata so
//! we can extract license/attribution.

use url::Url;

/// Returns the fully-formed Wikimedia Commons API URL for searching
/// `query`, requesting up to `count` results.
pub fn build_wikimedia_search_url(query: &str, count: u32) -> Result<String, String> {
    let mut url = Url::parse("https://commons.wikimedia.org/w/api.php")
        .map_err(|e| format!("Invalid Wikimedia base URL: {e}"))?;

    // Wikimedia only allows `gsrlimit` up to 50; clamp defensively to 1..=10
    // here since we don't want to flood the LLM context with images either.
    let limit = count.clamp(1, 10);

    {
        let mut qp = url.query_pairs_mut();
        qp.append_pair("action", "query");
        qp.append_pair("format", "json");
        qp.append_pair("formatversion", "2");
        qp.append_pair("generator", "search");
        qp.append_pair("gsrsearch", &format!("filetype:bitmap|drawing {query}"));
        qp.append_pair("gsrnamespace", "6"); // File: namespace
        qp.append_pair("gsrlimit", &limit.to_string());
        qp.append_pair("prop", "imageinfo");
        qp.append_pair("iiprop", "url|size|extmetadata|mime");
        qp.append_pair("iiurlwidth", "800");
        qp.append_pair("origin", "*");
    }

    Ok(url.to_string())
}
