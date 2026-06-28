use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn load_environment_variables_db(db: &Database, environment_id: &str) -> Vec<ApiEnvironmentVariable> {
    let conn = db.reader();
    conn.prepare(
        "SELECT id, environment_id, key, value, initial_value, is_secret, description, enabled, sort_order, created_at, updated_at
         FROM api_environment_variables WHERE environment_id = ?1 ORDER BY sort_order",
    )
    .and_then(|mut stmt| {
        stmt.query_map(params![environment_id], |row| {
            Ok(ApiEnvironmentVariable {
                id: row.get(0)?,
                environment_id: row.get(1)?,
                key: row.get(2)?,
                value: row.get(3)?,
                initial_value: row.get(4)?,
                is_secret: row.get(5)?,
                description: row.get(6)?,
                enabled: row.get(7)?,
                sort_order: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
    })
    .unwrap_or_default()
}

pub fn save_api_environment_variable_db(db: &Database, var: &ApiEnvironmentVariable) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT INTO api_environment_variables (id, environment_id, key, value, initial_value, is_secret, description, enabled, sort_order, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)
         ON CONFLICT(id) DO UPDATE SET
            key = excluded.key,
            value = excluded.value,
            initial_value = excluded.initial_value,
            is_secret = excluded.is_secret,
            description = excluded.description,
            enabled = excluded.enabled,
            sort_order = excluded.sort_order,
            updated_at = excluded.updated_at",
        params![
            var.id,
            var.environment_id,
            var.key,
            var.value,
            var.initial_value,
            var.is_secret,
            var.description,
            var.enabled,
            var.sort_order,
            var.created_at,
            var.updated_at,
        ],
    ) {
        eprintln!("[db] save_api_environment_variable: {e}");
    }
}

pub fn remove_api_environment_variable_db(db: &Database, variable_id: &str) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "DELETE FROM api_environment_variables WHERE id = ?1",
        params![variable_id],
    ) {
        eprintln!("[db] remove_api_environment_variable: {e}");
    }
}
