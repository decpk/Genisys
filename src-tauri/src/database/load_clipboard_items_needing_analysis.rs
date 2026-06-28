use super::Database;

/// Loads `(id, text_content)` for every text clipboard row that still lacks
/// computed content analysis (used by the one-time backfill).
pub fn load_clipboard_items_needing_analysis_db(db: &Database) -> Vec<(String, String)> {
    let conn = db.reader();

    let mut stmt = match conn.prepare(
        "SELECT id, text_content FROM clipboard_items
         WHERE content_type = 'text'
           AND text_content IS NOT NULL
           AND (smart_categories IS NULL OR smart_categories = '')",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_clipboard_items_needing_analysis prepare: {e}");
            return vec![];
        }
    };

    let rows = stmt.query_map([], |row| {
        let id: String = row.get(0)?;
        let text: String = row.get::<_, Option<String>>(1)?.unwrap_or_default();
        Ok((id, text))
    });

    match rows {
        Ok(mapped) => mapped.filter_map(|r| r.ok()).collect(),
        Err(e) => {
            eprintln!("[db] load_clipboard_items_needing_analysis query: {e}");
            vec![]
        }
    }
}
