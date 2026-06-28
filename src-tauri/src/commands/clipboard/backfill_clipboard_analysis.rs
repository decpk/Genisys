use super::analysis::analyze_text;
use crate::database::{
    load_clipboard_items_needing_analysis_db, update_clipboard_analysis_db, Database,
};

/// One-time catch-up that computes and persists content analysis for existing
/// text rows captured before the analysis columns existed (or any row left
/// with an empty `smart_categories`). Returns the number of rows updated.
///
/// Runs off the main thread at startup — see `lib.rs` setup.
pub fn backfill_clipboard_analysis(db: &Database) -> usize {
    let rows = load_clipboard_items_needing_analysis_db(db);
    let mut count = 0;

    for (id, text) in rows {
        let analysis = analyze_text(&text);
        let categories_json =
            serde_json::to_string(&analysis.smart_categories).unwrap_or_else(|_| "[]".to_string());
        let matches_json =
            serde_json::to_string(&analysis.sensitivity_matches).unwrap_or_else(|_| "[]".to_string());

        if update_clipboard_analysis_db(
            db,
            &id,
            &categories_json,
            &analysis.sensitivity_level,
            &matches_json,
        ) {
            count += 1;
        }
    }

    count
}
