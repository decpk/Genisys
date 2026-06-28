use std::collections::HashMap;
use std::sync::Mutex;

/// In-memory store of compiled slide HTML, keyed by slide id. The frontend
/// stages a slide's HTML here (via `cmd_webpoint_stage_slide`) just before
/// pointing the sandboxed iframe at `webpoint://localhost/slide/<id>`, which the
/// custom URI scheme handler then serves from this map.
#[derive(Default)]
pub struct WebpointRenderState {
    slides: Mutex<HashMap<String, String>>,
}

impl WebpointRenderState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn set(&self, slide_id: String, html: String) {
        if let Ok(mut map) = self.slides.lock() {
            map.insert(slide_id, html);
        }
    }

    pub fn get(&self, slide_id: &str) -> Option<String> {
        self.slides
            .lock()
            .ok()
            .and_then(|map| map.get(slide_id).cloned())
    }
}
