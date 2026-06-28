//! Prompt steering the vision model to emit ONLY a JSON array of absolute URLs
//! (see `commands::previewer::request_vision_urls`).

pub const VISION_PROMPT: &str = "You are looking at a screenshot of a web browser — it may show multiple tabs, a bookmarks bar, an address bar, or a list of links. Identify every distinct website shown. Respond with ONLY a valid JSON array of absolute URL strings, e.g. [\"https://example.com\", \"https://news.ycombinator.com\"]. For a tab that shows only a title and a recognizable site, infer the most likely absolute https URL. Do not include markdown, code fences, or any prose — just the JSON array.";
