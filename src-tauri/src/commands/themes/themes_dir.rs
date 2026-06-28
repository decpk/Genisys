use std::path::PathBuf;

use crate::helpers::get_data_dir;

/// Resolve the directory where user-defined custom theme JSON files are stored.
pub fn themes_dir() -> PathBuf {
    get_data_dir().join("themes")
}
