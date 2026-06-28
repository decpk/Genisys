use super::Database;

pub fn load_api_request_body_db(db: &Database, request_id: &str) -> Option<String> {
    let conn = db.reader();

    conn.query_row(
        "SELECT body_content FROM api_requests WHERE id = ?1",
        rusqlite::params![request_id],
        |row| row.get(0),
    )
    .ok()
}
