use rusqlite::params;

use super::Database;
use crate::types::NewsInterest;

pub fn save_news_interests_db(db: &Database, tile_id: &str, interests: &[NewsInterest]) {
    let conn = db.conn();
    if let Err(e) = conn.execute_batch("BEGIN IMMEDIATE") {
        eprintln!("[db] save_news_interests begin txn: {e}");
        return;
    }

    // Upsert each interest instead of DELETE-all + INSERT, to avoid
    // cascading ON DELETE CASCADE into news_articles.
    let mut stmt = match conn.prepare(
        "INSERT INTO news_interests (id, tile_id, category_key, label, custom_prompt, resolved_url, position, last_refreshed_at, created_at) \
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9) \
         ON CONFLICT(id) DO UPDATE SET \
           category_key = excluded.category_key, \
           label = excluded.label, \
           custom_prompt = excluded.custom_prompt, \
           resolved_url = excluded.resolved_url, \
           position = excluded.position, \
           last_refreshed_at = excluded.last_refreshed_at",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] save_news_interests prepare: {e}");
            let _ = conn.execute_batch("ROLLBACK");
            return;
        }
    };
    for i in interests {
        if let Err(e) = stmt.execute(params![
            i.id, i.tile_id, i.category_key, i.label, i.custom_prompt,
            i.resolved_url, i.position, i.last_refreshed_at, i.created_at
        ]) {
            eprintln!("[db] save_news_interests upsert: {e}");
        }
    }
    drop(stmt);

    // Remove only interests that are no longer in the provided list.
    // Only these removals will cascade-delete their news_articles rows.
    if !interests.is_empty() {
        let placeholders: Vec<String> = interests.iter().enumerate().map(|(idx, _)| format!("?{}", idx + 2)).collect();
        let sql = format!(
            "DELETE FROM news_interests WHERE tile_id = ?1 AND id NOT IN ({})",
            placeholders.join(",")
        );
        let mut del_params: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::with_capacity(interests.len() + 1);
        del_params.push(Box::new(tile_id.to_string()));
        for i in interests {
            del_params.push(Box::new(i.id.clone()));
        }
        let param_refs: Vec<&dyn rusqlite::types::ToSql> = del_params.iter().map(|p| p.as_ref()).collect();
        if let Err(e) = conn.execute(&sql, param_refs.as_slice()) {
            eprintln!("[db] save_news_interests delete removed: {e}");
        }
    } else {
        // All interests removed — delete everything for this tile
        if let Err(e) = conn.execute("DELETE FROM news_interests WHERE tile_id = ?1", params![tile_id]) {
            eprintln!("[db] save_news_interests delete all: {e}");
        }
    }

    if let Err(e) = conn.execute_batch("COMMIT") {
        eprintln!("[db] save_news_interests commit: {e}");
        let _ = conn.execute_batch("ROLLBACK");
    }
}
