// Shared backend commands used across features (Code Review, Chat, API Client, etc.).
//
//   * `cmd_code_read_file`    — UTF-8 file read with binary detection
//   * `cmd_code_read_file_as_data_url` — base64 data URL (used by image preview)
//   * `cmd_code_write_file`   — atomic write via temp + rename
//   * `cmd_code_walk`         — recursive directory walk (for AI context)
//   * `cmd_code_ai_completion`— streamed AI chat completion (AI review transport)
//
// All path inputs are absolute. Returns `{ success, data | error }` JSON.

mod cmd_code_ai_completion;
mod cmd_code_read_file;
mod cmd_code_read_file_as_data_url;
mod cmd_code_walk;
mod cmd_code_write_file;
mod utils;

pub use cmd_code_ai_completion::cmd_code_ai_completion;
pub use cmd_code_read_file::cmd_code_read_file;
pub use cmd_code_read_file_as_data_url::cmd_code_read_file_as_data_url;
pub use cmd_code_walk::cmd_code_walk;
pub use cmd_code_write_file::cmd_code_write_file;
