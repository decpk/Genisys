use super::variant_request_ctx::VariantRequestCtx;
use crate::commands::mock_server::runtime::templating::lookup_json_path;

/// Evaluate the `match_rules` JSON of a variant against a request.
///
/// `rules_json` is a JSON array of rule objects:
/// `{ "source": "query"|"header"|"body", "key": string, "op": "equals"|"contains"|"exists", "value": string }`
///
/// Semantics:
/// - All rules must pass (logical AND).
/// - An empty array matches everything (returns true).
/// - Invalid / non-array JSON returns false.
/// - `body` source resolves `key` as a JSON path via `lookup_json_path`.
/// - `header` lookups are case-insensitive on the key.
pub(crate) fn match_conditions(rules_json: &str, req: &VariantRequestCtx) -> bool {
    let parsed: serde_json::Value = match serde_json::from_str(rules_json) {
        Ok(v) => v,
        Err(_) => return false,
    };
    let rules = match parsed.as_array() {
        Some(arr) => arr,
        None => return false,
    };
    if rules.is_empty() {
        return true;
    }

    rules.iter().all(|rule| {
        let source = rule.get("source").and_then(|v| v.as_str()).unwrap_or("");
        let key = rule.get("key").and_then(|v| v.as_str()).unwrap_or("");
        let op = rule.get("op").and_then(|v| v.as_str()).unwrap_or("equals");
        let expected = rule.get("value").and_then(|v| v.as_str()).unwrap_or("");

        let actual: Option<String> = match source {
            "query" => req.query.get(key).cloned(),
            "header" => {
                let lower = key.to_ascii_lowercase();
                req.headers
                    .iter()
                    .find(|(k, _)| k.to_ascii_lowercase() == lower)
                    .map(|(_, v)| v.clone())
            }
            "body" => req
                .body_json
                .as_ref()
                .and_then(|b| lookup_json_path(b, key)),
            _ => None,
        };

        match op {
            "exists" => actual.is_some(),
            "equals" => actual.as_deref() == Some(expected),
            "contains" => actual
                .as_deref()
                .map(|a| a.contains(expected))
                .unwrap_or(false),
            _ => false,
        }
    })
}
