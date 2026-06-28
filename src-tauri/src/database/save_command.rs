use rusqlite::params;

use super::Database;
use crate::types::*;

pub fn save_command_db(db: &Database, command: &ChatCommand) {
    let conn = db.conn();
    if let Err(e) = conn.execute(
        "INSERT OR REPLACE INTO commands (id, name, description, tool_name, args_template, is_built_in, sort_order, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",
        params![command.id, command.name, command.description, command.tool_name,
                command.args_template, command.is_built_in as i64, command.sort_order,
                command.created_at, command.updated_at],
    ) { eprintln!("[db] save_command: {e}"); }
}
