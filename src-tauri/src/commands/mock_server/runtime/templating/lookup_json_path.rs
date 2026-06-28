/// Look up a dot-separated `path` (e.g. `user.name` or `items.0.id`) inside a
/// `serde_json::Value` and return the located value as a string.
///
/// - Object keys are matched by name.
/// - Numeric segments index into arrays.
/// - String values are returned as-is; other JSON values are stringified.
/// - Returns `None` if any segment is missing or the value is `null`.
pub(crate) fn lookup_json_path(value: &serde_json::Value, path: &str) -> Option<String> {
    let mut current = value;

    for part in path.split('.') {
        if part.is_empty() {
            continue;
        }
        match current {
            serde_json::Value::Object(map) => {
                current = map.get(part)?;
            }
            serde_json::Value::Array(arr) => {
                let idx: usize = part.parse().ok()?;
                current = arr.get(idx)?;
            }
            _ => return None,
        }
    }

    match current {
        serde_json::Value::String(s) => Some(s.clone()),
        serde_json::Value::Null => None,
        other => Some(other.to_string()),
    }
}
