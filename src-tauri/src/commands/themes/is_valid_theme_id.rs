/// Validates a custom theme id is safe for filesystem use.
///
/// Allowed: lowercase ASCII alphanumeric characters and hyphen, length 1..=64.
/// Rejects empty strings, paths separators, parent traversal, and any other character.
pub fn is_valid_theme_id(id: &str) -> bool {
    if id.is_empty() || id.len() > 64 {
        return false;
    }
    if id.contains("..") {
        return false;
    }
    id.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-')
}
