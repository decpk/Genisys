use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_api_response_snapshot_db(db: &Database, snapshot: &ApiResponseSnapshot) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO api_response_snapshots (id, execution_id, request_id, label, snapshot_type,
            status_code, status_text, headers, body, size_bytes, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)",
        params![
            snapshot.id,
            snapshot.execution_id,
            snapshot.request_id,
            snapshot.label,
            snapshot.snapshot_type,
            snapshot.status_code,
            snapshot.status_text,
            snapshot.headers,
            snapshot.body,
            snapshot.size_bytes,
            snapshot.created_at,
        ],
    ) {
        eprintln!("[db] save_api_response_snapshot: {e}");
    }
}

pub fn load_api_response_snapshots_db(db: &Database, request_id: &str) -> Vec<ApiResponseSnapshot> {
    let conn = db.reader();
    conn.prepare(
        "SELECT id, execution_id, request_id, label, snapshot_type, status_code, status_text,
                headers, body, size_bytes, created_at
         FROM api_response_snapshots WHERE request_id = ?1
         ORDER BY created_at DESC",
    )
    .and_then(|mut stmt| {
        stmt.query_map(params![request_id], |row| {
            Ok(ApiResponseSnapshot {
                id: row.get(0)?,
                execution_id: row.get(1)?,
                request_id: row.get(2)?,
                label: row.get(3)?,
                snapshot_type: row.get(4)?,
                status_code: row.get(5)?,
                status_text: row.get(6)?,
                headers: row.get(7)?,
                body: row.get(8)?,
                size_bytes: row.get(9)?,
                created_at: row.get(10)?,
            })
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
    })
    .unwrap_or_default()
}

pub fn remove_api_response_snapshot_db(db: &Database, snapshot_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM api_response_snapshots WHERE id = ?1",
        params![snapshot_id],
    ) {
        eprintln!("[db] remove_api_response_snapshot: {e}");
    }
}

pub fn save_api_saved_example_db(db: &Database, example: &ApiSavedExample) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO api_saved_examples (id, request_id, execution_id, name, description,
            status_code, headers, body, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)
         ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            description = excluded.description,
            updated_at = excluded.updated_at",
        params![
            example.id, example.request_id, example.execution_id, example.name,
            example.description, example.status_code, example.headers, example.body,
            example.created_at, example.updated_at,
        ],
    ) {
        eprintln!("[db] save_api_saved_example: {e}");
    }
}

pub fn load_api_saved_examples_db(db: &Database, request_id: &str) -> Vec<ApiSavedExample> {
    let conn = db.reader();
    conn.prepare(
        "SELECT id, request_id, execution_id, name, description, status_code, headers, body, created_at, updated_at
         FROM api_saved_examples WHERE request_id = ?1 ORDER BY created_at DESC",
    )
    .and_then(|mut stmt| {
        stmt.query_map(params![request_id], |row| {
            Ok(ApiSavedExample {
                id: row.get(0)?,
                request_id: row.get(1)?,
                execution_id: row.get(2)?,
                name: row.get(3)?,
                description: row.get(4)?,
                status_code: row.get(5)?,
                headers: row.get(6)?,
                body: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
    })
    .unwrap_or_default()
}

pub fn remove_api_saved_example_db(db: &Database, example_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM api_saved_examples WHERE id = ?1",
        params![example_id],
    ) {
        eprintln!("[db] remove_api_saved_example: {e}");
    }
}
