use std::fs;
use std::path::Path;

/// Recursively compute the total `(bytes, files)` to copy for `src`.
///
/// For a file, returns its size and a count of `1`. For a directory, sums the
/// totals of all children. Entries that fail to read (permissions, broken
/// symlinks, races) are skipped silently rather than aborting the walk.
pub fn compute_copy_total(src: &Path) -> (u64, u64) {
    let meta = match fs::metadata(src) {
        Ok(m) => m,
        Err(_) => return (0, 0),
    };

    if meta.is_file() {
        return (meta.len(), 1);
    }

    if meta.is_dir() {
        let mut total_bytes: u64 = 0;
        let mut total_files: u64 = 0;
        if let Ok(entries) = fs::read_dir(src) {
            for entry in entries.flatten() {
                let (b, f) = compute_copy_total(&entry.path());
                total_bytes += b;
                total_files += f;
            }
        }
        return (total_bytes, total_files);
    }

    (0, 0)
}
