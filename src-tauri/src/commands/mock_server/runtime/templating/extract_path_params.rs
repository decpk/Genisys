use std::collections::HashMap;

/// Extract path parameters by comparing an endpoint `pattern` (which may contain
/// `:name` segments) against the `actual_path` of the request.
///
/// Splits both inputs on `/` and, for every `:name` segment in the pattern,
/// maps `name -> actual segment`. Segments without a `:` prefix are ignored.
/// This is a pure helper so it can be used inside the boxed async handler
/// without fighting axum extractor generics.
pub(crate) fn extract_path_params(pattern: &str, actual_path: &str) -> HashMap<String, String> {
    let mut map = HashMap::new();

    let actual_segments: Vec<&str> = actual_path.trim_matches('/').split('/').collect();

    for (i, seg) in pattern.trim_matches('/').split('/').enumerate() {
        if let Some(name) = seg.strip_prefix(':') {
            if name.is_empty() {
                continue;
            }
            if let Some(actual) = actual_segments.get(i) {
                map.insert(name.to_string(), (*actual).to_string());
            }
        }
    }

    map
}
