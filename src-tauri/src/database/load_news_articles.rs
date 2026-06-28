use super::Database;
use crate::types::NewsArticle;

pub fn load_news_articles_db(db: &Database, interest_id: &str) -> Vec<NewsArticle> {
    let conn = db.reader();
    // Sort by article publication time when available, falling back to fetch time.
    // ISO-8601 strings sort lexicographically, so plain TEXT comparison is correct.
    // COALESCE keeps AI-generated articles (which often lack `published_at`) near the
    // top instead of letting them sink to the bottom as NULLs.
    let mut stmt = match conn.prepare(
        "SELECT id, interest_id, source_type, title, summary, url, \
         source_name, author, published_at, fetched_at, is_liked, liked_at, raw_hash, extras_json \
         FROM news_articles WHERE interest_id = ?1 \
         ORDER BY COALESCE(published_at, fetched_at) DESC LIMIT 20",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_news_articles prepare: {e}");
            return vec![];
        }
    };
    stmt.query_map([interest_id], |row| {
        Ok(NewsArticle {
            id: row.get(0)?,
            interest_id: row.get(1)?,
            source_type: row.get(2)?,
            title: row.get(3)?,
            summary: row.get(4)?,
            url: row.get(5)?,
            source_name: row.get(6)?,
            author: row.get(7)?,
            published_at: row.get(8)?,
            fetched_at: row.get(9)?,
            is_liked: row.get(10)?,
            liked_at: row.get(11)?,
            raw_hash: row.get(12)?,
            extras_json: row.get(13)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}

pub fn load_liked_news_articles_db(db: &Database, tile_id: &str) -> Vec<NewsArticle> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT a.id, a.interest_id, a.source_type, a.title, a.summary, a.url, \
         a.source_name, a.author, a.published_at, a.fetched_at, a.is_liked, a.liked_at, a.raw_hash, a.extras_json \
         FROM news_articles a INNER JOIN news_interests i ON a.interest_id = i.id \
         WHERE i.tile_id = ?1 AND a.is_liked = 1 ORDER BY a.liked_at DESC",
    ) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[db] load_liked_news_articles prepare: {e}");
            return vec![];
        }
    };
    stmt.query_map([tile_id], |row| {
        Ok(NewsArticle {
            id: row.get(0)?,
            interest_id: row.get(1)?,
            source_type: row.get(2)?,
            title: row.get(3)?,
            summary: row.get(4)?,
            url: row.get(5)?,
            source_name: row.get(6)?,
            author: row.get(7)?,
            published_at: row.get(8)?,
            fetched_at: row.get(9)?,
            is_liked: row.get(10)?,
            liked_at: row.get(11)?,
            raw_hash: row.get(12)?,
            extras_json: row.get(13)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect())
    .unwrap_or_default()
}
