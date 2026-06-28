use rusqlite::params;
use super::Database;

pub fn seed_default_clipboard_labels_db(db: &Database) {
    let conn = db.conn();

    // Check if labels already exist
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM clipboard_labels", [], |row| row.get(0))
        .unwrap_or(0);

    if count > 0 {
        return;
    }

    let now = chrono::Utc::now().to_rfc3339();

    let defaults = [
        ("lbl_important", "Important", "#ef4444"),
        ("lbl_review", "Review", "#f59e0b"),
        ("lbl_archive", "Archive", "#6b7280"),
        ("lbl_reference", "Reference", "#3b82f6"),
    ];

    for (id, name, color) in defaults {
        if let Err(e) = conn.execute(
            "INSERT OR IGNORE INTO clipboard_labels (id, name, color, created_at) VALUES (?1, ?2, ?3, ?4)",
            params![id, name, color, now],
        ) {
            eprintln!("[db] seed_default_clipboard_labels: {e}");
        }
    }
}
