use std::path::Path;

/// Cheap binary heuristic: if the first 8KB contains a NUL byte, treat as binary.
pub fn looks_binary(bytes: &[u8]) -> bool {
    let head = &bytes[..bytes.len().min(8192)];
    head.contains(&0u8)
}

/// Check that `path` is a non-empty absolute path.
pub fn ensure_abs(path: &Path) -> Result<(), String> {
    if path.as_os_str().is_empty() {
        return Err("Empty path".to_string());
    }
    if !path.is_absolute() {
        return Err(format!("Path must be absolute: {}", path.display()));
    }
    Ok(())
}
