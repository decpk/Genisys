use super::Database;
use serde_json::{json, Value};

pub fn execute_raw_query_db(db: &Database, query: &str, is_write: bool) -> Value {
    let trimmed = query.trim();
    if trimmed.is_empty() {
        return json!({ "success": false, "error": "Empty query" });
    }

    if is_write {
        let conn = db.conn();
        match conn.execute_batch(trimmed) {
            Ok(_) => {
                let changes = conn.changes();
                json!({
                    "success": true,
                    "changes": changes,
                    "columns": [],
                    "rows": []
                })
            }
            Err(e) => json!({ "success": false, "error": e.to_string() }),
        }
    } else {
        let conn = db.reader();
        let mut stmt = match conn.prepare(trimmed) {
            Ok(s) => s,
            Err(e) => return json!({ "success": false, "error": e.to_string() }),
        };

        let col_count = stmt.column_count();
        let columns: Vec<String> = (0..col_count)
            .map(|i| stmt.column_name(i).unwrap_or("?").to_string())
            .collect();

        let rows_result: Result<Vec<Vec<Value>>, _> = stmt.query_map([], |row| {
            let mut vals = Vec::with_capacity(col_count);
            for i in 0..col_count {
                let val: Value = match row.get_ref(i) {
                    Ok(rusqlite::types::ValueRef::Null) => Value::Null,
                    Ok(rusqlite::types::ValueRef::Integer(n)) => json!(n),
                    Ok(rusqlite::types::ValueRef::Real(f)) => json!(f),
                    Ok(rusqlite::types::ValueRef::Text(t)) => {
                        json!(String::from_utf8_lossy(t).to_string())
                    }
                    Ok(rusqlite::types::ValueRef::Blob(b)) => {
                        json!(format!("<blob {} bytes>", b.len()))
                    }
                    Err(_) => Value::Null,
                };
                vals.push(val);
            }
            Ok(vals)
        }).and_then(|mapped| mapped.collect());

        match rows_result {
            Ok(rows) => json!({
                "success": true,
                "columns": columns,
                "rows": rows,
                "count": rows.len()
            }),
            Err(e) => json!({ "success": false, "error": e.to_string() }),
        }
    }
}

pub fn get_table_names_db(db: &Database) -> Vec<String> {
    let conn = db.reader();
    let mut stmt = conn
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
        .unwrap();
    stmt.query_map([], |row| row.get::<_, String>(0))
        .unwrap()
        .filter_map(|r| r.ok())
        .collect()
}
