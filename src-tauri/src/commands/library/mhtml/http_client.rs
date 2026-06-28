use reqwest::blocking::Client;
use url::Url;

/// Build a browser-like HTTP client for fetching web pages and their resources.
pub fn build_http_client(parsed_url: &Url) -> Result<Client, String> {
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(
        reqwest::header::ACCEPT,
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
            .parse()
            .unwrap(),
    );
    headers.insert(
        reqwest::header::ACCEPT_LANGUAGE,
        "en-US,en;q=0.9".parse().unwrap(),
    );
    headers.insert(
        reqwest::header::ACCEPT_ENCODING,
        "gzip, deflate, br".parse().unwrap(),
    );
    headers.insert(
        reqwest::header::CONNECTION,
        "keep-alive".parse().unwrap(),
    );
    headers.insert("Sec-Fetch-Dest", "document".parse().unwrap());
    headers.insert("Sec-Fetch-Mode", "navigate".parse().unwrap());
    headers.insert("Sec-Fetch-Site", "none".parse().unwrap());
    headers.insert("Sec-Fetch-User", "?1".parse().unwrap());
    headers.insert(
        "Sec-CH-UA",
        r#""Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99""#
            .parse()
            .unwrap(),
    );
    headers.insert("Sec-CH-UA-Mobile", "?0".parse().unwrap());
    headers.insert(
        "Sec-CH-UA-Platform",
        r#""macOS""#.parse().unwrap(),
    );
    headers.insert(
        reqwest::header::UPGRADE_INSECURE_REQUESTS,
        "1".parse().unwrap(),
    );
    headers.insert(
        reqwest::header::CACHE_CONTROL,
        "max-age=0".parse().unwrap(),
    );

    let _ = parsed_url; // used by caller for cookie warm-up

    Client::builder()
        .user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
        .default_headers(headers)
        .timeout(std::time::Duration::from_secs(30))
        .redirect(reqwest::redirect::Policy::limited(10))
        .cookie_store(true)
        .gzip(true)
        .brotli(true)
        .deflate(true)
        .build()
        .map_err(|e| e.to_string())
}
