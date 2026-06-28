use crate::types::SensitivityMatch;

/// Result of analyzing a clipboard text item once at capture time.
///
/// Persisted to SQLite and returned to the frontend so the UI never has to
/// re-run the (expensive) regex detectors on every render or scroll.
pub struct ClipboardTextAnalysis {
    pub smart_categories: Vec<String>,
    pub sensitivity_level: String,
    pub sensitivity_matches: Vec<SensitivityMatch>,
}
