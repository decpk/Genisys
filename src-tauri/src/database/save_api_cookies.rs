use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn load_api_cookies_db(db: &Database, jar_id: &str) -> Vec<ApiCookie> {
    let conn = db.reader();
    conn.prepare(
        "SELECT id, jar_id, name, value, domain, path, secure, http_only, same_site, expires_at, created_at, updated_at
         FROM api_cookies WHERE jar_id = ?1 ORDER BY domain, path, name",
    )
    .and_then(|mut stmt| {
        stmt.query_map(params![jar_id], |row| {
            Ok(ApiCookie {
                id: row.get(0)?,
                jar_id: row.get(1)?,
                name: row.get(2)?,
                value: row.get(3)?,
                domain: row.get(4)?,
                path: row.get(5)?,
                secure: row.get(6)?,
                http_only: row.get(7)?,
                same_site: row.get(8)?,
                expires_at: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
    })
    .unwrap_or_default()
}

pub fn load_api_cookie_jars_db(db: &Database, workspace_id: &str) -> Vec<ApiCookieJar> {
    let conn = db.reader();
    conn.prepare(
        "SELECT id, workspace_id, environment_id, name, created_at, updated_at
         FROM api_cookie_jars WHERE workspace_id = ?1 ORDER BY name",
    )
    .and_then(|mut stmt| {
        stmt.query_map(params![workspace_id], |row| {
            Ok(ApiCookieJar {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                environment_id: row.get(2)?,
                name: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
    })
    .unwrap_or_default()
}

pub fn save_api_cookie_jar_db(db: &Database, jar: &ApiCookieJar) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO api_cookie_jars (id, workspace_id, environment_id, name, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6)
         ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            updated_at = excluded.updated_at",
        params![
            jar.id, jar.workspace_id, jar.environment_id, jar.name, jar.created_at, jar.updated_at,
        ],
    ) {
        eprintln!("[db] save_api_cookie_jar: {e}");
    }
}

pub fn save_api_cookie_db(db: &Database, cookie: &ApiCookie) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO api_cookies (id, jar_id, name, value, domain, path, secure, http_only, same_site, expires_at, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12)
         ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            value = excluded.value,
            domain = excluded.domain,
            path = excluded.path,
            secure = excluded.secure,
            http_only = excluded.http_only,
            same_site = excluded.same_site,
            expires_at = excluded.expires_at,
            updated_at = excluded.updated_at",
        params![
            cookie.id, cookie.jar_id, cookie.name, cookie.value,
            cookie.domain, cookie.path, cookie.secure, cookie.http_only,
            cookie.same_site, cookie.expires_at, cookie.created_at, cookie.updated_at,
        ],
    ) {
        eprintln!("[db] save_api_cookie: {e}");
    }
}

pub fn remove_api_cookie_db(db: &Database, cookie_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM api_cookies WHERE id = ?1",
        params![cookie_id],
    ) {
        eprintln!("[db] remove_api_cookie: {e}");
    }
}

pub fn clear_api_cookie_jar_db(db: &Database, jar_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM api_cookies WHERE jar_id = ?1",
        params![jar_id],
    ) {
        eprintln!("[db] clear_api_cookie_jar: {e}");
    }
}
