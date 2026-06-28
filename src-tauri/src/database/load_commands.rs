use super::Database;
use crate::types::*;

pub fn load_commands_db(db: &Database) -> Vec<ChatCommand> {
    let conn = db.reader();
    let mut stmt = match conn.prepare(
        "SELECT id, name, description, tool_name, args_template, is_built_in, sort_order, created_at, updated_at
         FROM commands ORDER BY sort_order ASC",
    ) { Ok(s) => s, Err(e) => { eprintln!("[db] load_commands prepare: {e}"); return vec![]; } };
    stmt.query_map([], |row| {
        let is_built_in: i64 = row.get(5)?;
        Ok(ChatCommand {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            tool_name: row.get(3)?,
            args_template: row.get(4)?,
            is_built_in: is_built_in != 0,
            sort_order: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    })
    .map(|rows| rows.filter_map(|r| r.ok()).collect()).unwrap_or_default()
}
