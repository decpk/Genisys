use std::collections::HashMap;

/// Parse a URL query string (e.g. `a=1&b=2`) into a key/value map.
///
/// Uses the `url` crate (already a dependency) for correct percent-decoding by
/// parsing the query into a throwaway URL. Returns an empty map for an empty or
/// unparseable query string.
pub(crate) fn parse_query(query_string: &str) -> HashMap<String, String> {
    let mut map = HashMap::new();
    if query_string.is_empty() {
        return map;
    }

    if let Ok(url) = url::Url::parse(&format!("http://localhost/?{}", query_string)) {
        for (k, v) in url.query_pairs() {
            map.insert(k.into_owned(), v.into_owned());
        }
    }

    map
}
