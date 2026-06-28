use super::resolve_token::resolve_token;
use super::template_context::TemplateContext;

/// Render a response body by replacing every `{{ ... }}` token with its resolved
/// value from `ctx`. Unknown or unresolved tokens are left untouched so a body
/// that happens to contain literal braces is preserved.
///
/// This is a single forward scan (no regex), UTF-8 safe, and never panics.
pub(crate) fn render_template(body: &str, ctx: &TemplateContext) -> String {
    // Fast path: nothing to interpolate.
    if !body.contains("{{") {
        return body.to_string();
    }

    let bytes = body.as_bytes();
    let len = bytes.len();
    let mut result = String::with_capacity(len);
    let mut i = 0;

    while i < len {
        if i + 1 < len && bytes[i] == b'{' && bytes[i + 1] == b'{' {
            if let Some(close) = body[i + 2..].find("}}") {
                let token = &body[i + 2..i + 2 + close];
                match resolve_token(token, ctx) {
                    Some(val) => result.push_str(&val),
                    // Leave the original `{{token}}` untouched when unresolved.
                    None => result.push_str(&body[i..i + 2 + close + 2]),
                }
                i = i + 2 + close + 2;
                continue;
            } else {
                // Unterminated `{{` — emit the remainder verbatim.
                result.push_str(&body[i..]);
                break;
            }
        }

        // Copy a full UTF-8 char to keep byte indices on char boundaries.
        let ch = body[i..].chars().next().unwrap();
        result.push(ch);
        i += ch.len_utf8();
    }

    result
}
