use super::analyze_sensitivity::analyze_sensitivity;
use super::clipboard_text_analysis::ClipboardTextAnalysis;
use super::detect_categories::detect_categories;

/// Upper bound on how much text is analyzed, to keep worst-case cost bounded on
/// very large pastes. The first `MAX_ANALYSIS_BYTES` (sliced on a char
/// boundary) are analyzed.
const MAX_ANALYSIS_BYTES: usize = 50_000;

/// Computes the full content analysis (smart categories + sensitivity) for a
/// clipboard text item. Runs once at capture time (or during backfill).
pub fn analyze_text(text: &str) -> ClipboardTextAnalysis {
    let slice = if text.len() > MAX_ANALYSIS_BYTES {
        let mut end = MAX_ANALYSIS_BYTES;
        while end > 0 && !text.is_char_boundary(end) {
            end -= 1;
        }
        &text[..end]
    } else {
        text
    };

    let smart_categories = detect_categories(slice);
    let (sensitivity_level, sensitivity_matches) = analyze_sensitivity(slice);

    ClipboardTextAnalysis {
        smart_categories,
        sensitivity_level,
        sensitivity_matches,
    }
}
