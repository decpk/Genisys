use super::faker::{
    faker_bool, faker_date, faker_email, faker_name, faker_number, faker_uuid,
};
use super::lookup_json_path::lookup_json_path;
use super::template_context::TemplateContext;

/// Resolve a single template token (the trimmed contents of `{{ ... }}`).
///
/// Supported tokens:
/// - `params.NAME`     — path parameter value
/// - `query.NAME`      — query string parameter value
/// - `body.PATH`       — dot-path lookup into the parsed JSON request body
/// - `now`             — current RFC3339 timestamp
/// - `faker.X`         — generated fake value (see [`resolve_faker`])
///
/// Returns `None` when the token is unknown or the referenced value is absent,
/// allowing the renderer to leave the original `{{token}}` untouched.
pub(crate) fn resolve_token(token: &str, ctx: &TemplateContext) -> Option<String> {
    let token = token.trim();

    if token == "now" {
        return Some(chrono::Utc::now().to_rfc3339());
    }

    if let Some(name) = token.strip_prefix("params.") {
        return ctx.params.get(name).cloned();
    }

    if let Some(name) = token.strip_prefix("query.") {
        return ctx.query.get(name).cloned();
    }

    if let Some(path) = token.strip_prefix("body.") {
        return ctx
            .body_json
            .as_ref()
            .and_then(|v| lookup_json_path(v, path));
    }

    if let Some(spec) = token.strip_prefix("faker.") {
        return resolve_faker(spec);
    }

    None
}

/// Resolve a `faker.*` specifier such as `uuid`, `name`, `number`, or
/// `number(1,10)` into a generated value.
fn resolve_faker(spec: &str) -> Option<String> {
    let (name, args) = match spec.split_once('(') {
        Some((n, rest)) => (n.trim(), Some(rest.trim_end_matches(')').trim())),
        None => (spec.trim(), None),
    };

    match name {
        "uuid" => Some(faker_uuid()),
        "name" => Some(faker_name()),
        "email" => Some(faker_email()),
        "number" => Some(faker_number(args)),
        "bool" => Some(faker_bool()),
        "date" => Some(faker_date()),
        _ => None,
    }
}
