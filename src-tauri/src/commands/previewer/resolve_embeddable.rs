use reqwest::header::HeaderMap;

/// Decide whether a page may be embedded inside an `<iframe>` based on its
/// security headers. Returns `"no"` when framing is blocked, otherwise `"yes"`.
///
/// Rules (case-insensitive):
/// - `X-Frame-Options` containing `DENY` or `SAMEORIGIN` → `"no"`.
/// - `Content-Security-Policy` `frame-ancestors` directive whose value is
///   `'none'` (or that does not include a `*` wildcard) → `"no"`.
/// - Otherwise → `"yes"`.
pub fn resolve_embeddable(headers: &HeaderMap) -> &'static str {
    // ── X-Frame-Options ────────────────────────────────────────
    if let Some(xfo) = headers
        .get("x-frame-options")
        .and_then(|v| v.to_str().ok())
    {
        let xfo_lc = xfo.to_ascii_lowercase();
        if xfo_lc.contains("deny") || xfo_lc.contains("sameorigin") {
            return "no";
        }
    }

    // ── Content-Security-Policy: frame-ancestors ───────────────
    if let Some(csp) = headers
        .get("content-security-policy")
        .and_then(|v| v.to_str().ok())
    {
        let csp_lc = csp.to_ascii_lowercase();
        if let Some(idx) = csp_lc.find("frame-ancestors") {
            // Isolate the directive value up to the next ';'.
            let rest = &csp_lc[idx + "frame-ancestors".len()..];
            let directive = rest.split(';').next().unwrap_or("").trim();
            if directive.contains("'none'") || !directive.contains('*') {
                return "no";
            }
        }
    }

    "yes"
}
