use std::borrow::Cow;

use tauri::http::{Request, Response};
use tauri::Manager;

use super::render_state::WebpointRenderState;

/// CSP applied to every served slide document. The frame runs with
/// `sandbox="allow-scripts"` (opaque origin — no same-origin access to Genisys),
/// and this header additionally blocks all network egress while still allowing
/// the inline styles/scripts and data-URI media a compiled slide needs.
const SLIDE_CSP: &str = "default-src 'none'; img-src data: blob:; media-src data: blob:; font-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline';";

/// Handler for the `webpoint://` URI scheme. Serves the compiled HTML for
/// `webpoint://localhost/slide/<slide_id>` out of `WebpointRenderState`.
pub fn handle_webpoint_render_request<R: tauri::Runtime>(
    ctx: tauri::UriSchemeContext<'_, R>,
    request: Request<Vec<u8>>,
) -> Response<Cow<'static, [u8]>> {
    let uri = request.uri().to_string();
    let slide_id = match parse_slide_id(&uri) {
        Some(id) => id,
        None => return error_response(400, b"invalid uri"),
    };

    let state = ctx.app_handle().state::<WebpointRenderState>();
    match state.get(&slide_id) {
        Some(html) => Response::builder()
            .status(200)
            .header("Content-Type", "text/html; charset=utf-8")
            .header("Content-Security-Policy", SLIDE_CSP)
            .header("Cache-Control", "no-store")
            .header("X-Content-Type-Options", "nosniff")
            .body(Cow::Owned(html.into_bytes()))
            .unwrap(),
        None => error_response(404, b"slide not staged"),
    }
}

/// Extract `<slide_id>` from any host form of `.../slide/<slide_id>` (the
/// webview may rewrite the scheme to `https://webpoint.localhost/...`).
fn parse_slide_id(uri: &str) -> Option<String> {
    let idx = uri.find("/slide/")?;
    let rest = &uri[idx + "/slide/".len()..];
    let segment = rest.split(['?', '#', '/']).next().unwrap_or("");
    if segment.is_empty() {
        return None;
    }
    Some(segment.to_string())
}

fn error_response(status: u16, body: &'static [u8]) -> Response<Cow<'static, [u8]>> {
    Response::builder()
        .status(status)
        .header("Content-Type", "text/plain")
        .body(Cow::Borrowed(body))
        .unwrap()
}
