/// Reject anything that could escape the `clipboard-images/` directory or
/// reference an absolute path. The frontend stores only a bare filename
/// (e.g. `"<uuid>.png"`), so we refuse path separators and parent-dir tokens.
pub fn validate_clipboard_filename(filename: &str) -> Result<(), String> {
    if filename.is_empty() {
        return Err("filename is empty".to_string());
    }
    if filename.contains('/') || filename.contains('\\') {
        return Err("filename must not contain path separators".to_string());
    }
    if filename.contains("..") {
        return Err("filename must not contain '..'".to_string());
    }
    if filename.starts_with('.') {
        return Err("filename must not start with '.'".to_string());
    }
    Ok(())
}
