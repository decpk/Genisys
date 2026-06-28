use rusqlite::params;

use super::Database;
use crate::types::NewsArticle;

pub fn save_news_articles_db(db: &Database, interest_id: &str, articles: &[NewsArticle]) {
    let conn = db.conn();
    if let Err(e) = conn.execute_batch("BEGIN IMMEDIATE") {
        eprintln!("[db] save_news_articles begin txn: {e}");
        return;
    }
    // Delete non-liked articles for this interest (keep liked ones)
    if let Err(e) = conn.execute(
        "DELETE FROM news_articles WHERE interest_id = ?1 AND is_liked = 0",
        params![interest_id],
    ) {
        eprintln!("[db] save_news_articles delete: {e}");
        let _ = conn.execute_batch("ROLLBACK");
        return;
    }
    let mut stmt = match conn.prepare(
        "INSERT OR IGNORE INTO news_articles \
         (id, interest_id, source_type, title, summary, url, \
          source_name, author, published_at, fetched_at, is_liked, liked_at, raw_hash, extras_json) \
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14)",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] save_news_articles prepare: {e}");
            let _ = conn.execute_batch("ROLLBACK");
            return;
        }
    };
    for a in articles {
        if let Err(e) = stmt.execute(params![
            a.id, a.interest_id, a.source_type, a.title, a.summary, a.url,
            a.source_name, a.author, a.published_at, a.fetched_at, a.is_liked, a.liked_at,
            a.raw_hash, a.extras_json
        ]) {
            eprintln!("[db] save_news_articles insert: {e}");
        }
    }
    drop(stmt);
    if let Err(e) = conn.execute_batch("COMMIT") {
        eprintln!("[db] save_news_articles commit: {e}");
        let _ = conn.execute_batch("ROLLBACK");
    }
}

pub fn toggle_news_article_liked_db(db: &Database, article_id: &str, liked: bool) {
    let conn = db.conn();
    let liked_at = if liked {
        Some(chrono::Utc::now().to_rfc3339())
    } else {
        None
    };
    if let Err(e) = conn.execute(
        "UPDATE news_articles SET is_liked = ?1, liked_at = ?2 WHERE id = ?3",
        params![liked, liked_at, article_id],
    ) {
        eprintln!("[db] toggle_news_article_liked: {e}");
    }
}

pub fn delete_news_articles_for_interest_db(db: &Database, interest_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM news_articles WHERE interest_id = ?1",
        params![interest_id],
    ) {
        eprintln!("[db] delete_news_articles_for_interest: {e}");
    }
}
