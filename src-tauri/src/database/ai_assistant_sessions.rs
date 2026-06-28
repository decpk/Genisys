use rusqlite::params;

use super::Database;
use crate::types::AIAssistantSessionMeta;

fn map_session_row(row: &rusqlite::Row) -> rusqlite::Result<AIAssistantSessionMeta> {
    Ok(AIAssistantSessionMeta {
        id: row.get(0)?,
        app_id: row.get(1)?,
        scope_key: row.get(2)?,
        conversation_id: row.get(3)?,
        title: row.get(4)?,
        created_at: row.get(5)?,
        updated_at: row.get(6)?,
    })
}

pub fn load_ai_sessions_db(
    db: &Database,
    app_id: &str,
    scope_key: Option<&str>,
) -> Vec<AIAssistantSessionMeta> {
    let conn = db.reader();
    // When a scope_key is supplied (PR-scoped panels), return that scope's own
    // sessions plus legacy rows with no scope (NULL) so they stay visible.
    let result = match scope_key {
        Some(scope) => conn
            .prepare(
                "SELECT id, app_id, scope_key, conversation_id, title, created_at, updated_at
                 FROM ai_assistant_sessions
                 WHERE app_id = ?1 AND (scope_key = ?2 OR scope_key IS NULL)
                 ORDER BY updated_at DESC",
            )
            .and_then(|mut stmt| {
                stmt.query_map(params![app_id, scope], map_session_row)
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            }),
        None => conn
            .prepare(
                "SELECT id, app_id, scope_key, conversation_id, title, created_at, updated_at
                 FROM ai_assistant_sessions WHERE app_id = ?1 ORDER BY updated_at DESC",
            )
            .and_then(|mut stmt| {
                stmt.query_map(params![app_id], map_session_row)
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            }),
    };
    match result {
        Ok(sessions) => sessions,
        Err(e) => {
            eprintln!("[db] load_ai_sessions: {e}");
            vec![]
        }
    }
}

pub fn save_ai_session_db(db: &Database, session: &AIAssistantSessionMeta) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO ai_assistant_sessions (id, app_id, scope_key, conversation_id, title, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            session.id,
            session.app_id,
            session.scope_key,
            session.conversation_id,
            session.title,
            session.created_at,
            session.updated_at,
        ],
    ) {
        eprintln!("[db] save_ai_session: {e}");
    }
}

pub fn remove_ai_session_db(db: &Database, session_id: &str) {
    let conn = db.conn();
    // First get conversation_id to cascade-delete the conversation
    let conv_id: Option<String> = conn
        .query_row(
            "SELECT conversation_id FROM ai_assistant_sessions WHERE id = ?1",
            params![session_id],
            |row| row.get(0),
        )
        .ok();

    conn.execute(
        "DELETE FROM ai_assistant_sessions WHERE id = ?1",
        params![session_id],
    )
    .ok();

    // Also remove the linked conversation (messages cascade via FK)
    if let Some(cid) = conv_id {
        conn.execute(
            "DELETE FROM conversations WHERE id = ?1",
            params![cid],
        )
        .ok();
    }
}

pub fn clear_ai_sessions_db(
    db: &Database,
    app_id: &str,
    scope_key: Option<&str>,
    except_session_id: Option<&str>,
) {
    let conn = db.conn();

    // Build the WHERE clause dynamically so the same predicate drives both the
    // conversation-id lookup and the delete. When a scope_key is supplied we
    // clear that scope's own rows plus legacy (NULL) rows shown under it.
    let mut where_clause = String::from("app_id = ?");
    let mut args: Vec<&dyn rusqlite::ToSql> = vec![&app_id];
    if let Some(scope) = &scope_key {
        where_clause.push_str(" AND (scope_key = ? OR scope_key IS NULL)");
        args.push(scope);
    }
    if let Some(keep) = &except_session_id {
        where_clause.push_str(" AND id != ?");
        args.push(keep);
    }

    // Collect conversation IDs before deleting sessions so their conversations
    // (and messages, via cascade) can be removed too.
    let select_sql =
        format!("SELECT conversation_id FROM ai_assistant_sessions WHERE {where_clause}");
    let conv_ids: Vec<String> = conn
        .prepare(&select_sql)
        .and_then(|mut stmt| {
            stmt.query_map(args.as_slice(), |row| row.get::<_, String>(0))
                .map(|rows| rows.filter_map(|r| r.ok()).collect())
        })
        .unwrap_or_default();

    let delete_sql = format!("DELETE FROM ai_assistant_sessions WHERE {where_clause}");
    conn.execute(&delete_sql, args.as_slice()).ok();

    // Remove linked conversations (messages cascade via FK)
    for cid in &conv_ids {
        conn.execute("DELETE FROM conversations WHERE id = ?1", params![cid])
            .ok();
    }
}
