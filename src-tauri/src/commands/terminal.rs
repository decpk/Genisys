// Integrated terminal — PTY-backed shell sessions exposed as Tauri commands.
//
// Commands:
//   * cmd_terminal_create        — spawn a new shell session, return its UUID
//   * cmd_terminal_write         — write input to a session's stdin
//   * cmd_terminal_resize        — resize a session's PTY
//   * cmd_terminal_kill          — kill a session
//   * cmd_terminal_list          — list active session IDs
//   * cmd_terminal_default_shell — return the default shell path/args for this OS
//
// Events emitted via tauri::Emitter:
//   * "terminal-output" { id, data }   — base64-encoded raw PTY bytes
//   * "terminal-exit"   { id, code }   — session ended
mod create_session;
mod cwd;
mod default_shell;
mod get_default_shell;
mod history_read;
mod kill_session;
mod list_dir;
mod list_sessions;
mod resize;
mod session_store;
mod spawn_pty;
mod state;
mod types;
mod write_input;

pub use create_session::cmd_terminal_create;
pub use create_session::spawn_terminal_session;
pub use cwd::cmd_terminal_cwd;
pub use get_default_shell::cmd_terminal_default_shell;
pub use history_read::cmd_terminal_history_read;
pub use kill_session::cmd_terminal_kill;
pub use list_dir::cmd_terminal_list_dir;
pub use list_sessions::cmd_terminal_list;
pub use resize::cmd_terminal_resize;
pub use session_store::cmd_terminal_session_delete;
pub use session_store::cmd_terminal_session_load;
pub use session_store::cmd_terminal_session_prune;
pub use session_store::cmd_terminal_session_save;
pub use state::TerminalManager;
pub use types::CreateTerminalParams;
pub use write_input::cmd_terminal_write;
