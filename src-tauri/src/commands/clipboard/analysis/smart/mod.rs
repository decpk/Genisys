mod detect_code;
mod detect_color;
mod detect_email;
mod detect_filepath;
mod detect_json;
mod detect_phone;
mod detect_shell;
mod detect_url;

pub use detect_code::detect_code;
pub use detect_color::detect_color;
pub use detect_email::detect_email;
pub use detect_filepath::detect_filepath;
pub use detect_json::detect_json;
pub use detect_phone::detect_phone;
pub use detect_shell::detect_shell;
pub use detect_url::detect_url;
