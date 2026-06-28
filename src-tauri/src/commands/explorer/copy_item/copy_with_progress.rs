use std::fs;
use std::path::Path;

use super::copy_accumulator::CopyAccumulator;
use super::emit_copy_progress::emit_copy_progress;

/// Recursively copy `src` to `dst`, updating `acc` and emitting throttled
/// progress events as each file completes.
///
/// Directories are created with `create_dir_all` and walked entry by entry.
/// Files are copied via `fs::copy`; the source file's byte length is added to
/// `acc.copied_bytes` and the file count is incremented. fs errors propagate as
/// `Err(String)`.
pub fn copy_with_progress(
    window: &tauri::Window,
    acc: &mut CopyAccumulator,
    src: &Path,
    dst: &Path,
) -> Result<(), String> {
    if src.is_dir() {
        fs::create_dir_all(dst)
            .map_err(|e| format!("Failed to create {}: {e}", dst.display()))?;
        for entry in
            fs::read_dir(src).map_err(|e| format!("Failed to read {}: {e}", src.display()))?
        {
            let entry = entry.map_err(|e| e.to_string())?;
            let child_src = entry.path();
            let child_dst = dst.join(entry.file_name());
            copy_with_progress(window, acc, &child_src, &child_dst)?;
        }
        return Ok(());
    }

    let file_size = fs::metadata(src).map(|m| m.len()).unwrap_or(0);
    fs::copy(src, dst).map_err(|e| format!("Failed to copy {}: {e}", src.display()))?;

    acc.copied_bytes += file_size;
    acc.files_done += 1;

    let file_name = src
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();
    emit_copy_progress(window, acc, &file_name, false);

    Ok(())
}
