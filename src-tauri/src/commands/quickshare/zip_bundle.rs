//! Shared helper that bundles several tray files into a single zip archive on
//! disk. Used by both the desktop "Zip & send" command and the phone
//! "Download as zip" route. The `zip` crate is synchronous, so callers run this
//! inside `tokio::task::spawn_blocking`.

use std::collections::HashSet;
use std::io::{self, Write};
use std::path::Path;

use zip::result::ZipResult;
use zip::write::SimpleFileOptions;
use zip::{CompressionMethod, ZipWriter};

use super::types::TrayItem;
use super::util::sanitize_filename;

/// Summary of a completed bundle.
pub struct ZipSummary {
    /// Number of file entries actually written into the archive.
    pub files: u32,
    /// Total size of the finished zip on disk, in bytes.
    pub size: u64,
}

/// Write every file `item` (by its desktop `local_path`) into a zip at `dest`.
/// Text items, items without a local path, and files that can't be opened are
/// skipped — a valid archive is always produced. Entry names are sanitized and
/// de-duplicated. `compress` selects Deflated (smaller) vs Stored (faster).
///
/// Synchronous (the `zip` crate is blocking) — call inside `spawn_blocking`.
pub fn build_zip(items: &[TrayItem], dest: &Path, compress: bool) -> ZipResult<ZipSummary> {
    let file = std::fs::File::create(dest)?;
    let mut zip = ZipWriter::new(file);
    let method = if compress {
        CompressionMethod::Deflated
    } else {
        CompressionMethod::Stored
    };
    let options = SimpleFileOptions::default()
        .compression_method(method)
        .large_file(true);

    let mut used: HashSet<String> = HashSet::new();
    let mut files = 0u32;
    for item in items {
        if item.kind != "file" {
            continue;
        }
        let src = match item.local_path.as_deref() {
            Some(p) => p,
            None => continue,
        };
        let mut input = match std::fs::File::open(src) {
            Ok(f) => f,
            Err(_) => continue, // best-effort: skip files that vanished
        };
        let entry_name = unique_entry_name(&sanitize_filename(&item.name), &mut used);
        zip.start_file(entry_name, options)?;
        io::copy(&mut input, &mut zip)?;
        files += 1;
    }

    let mut finished = zip.finish()?;
    finished.flush()?;
    let size = finished.metadata().map(|m| m.len()).unwrap_or(0);
    Ok(ZipSummary { files, size })
}

/// Ensure a unique entry name within the archive, appending " (1)", " (2)", …
/// before the extension on collision (mirrors `util::unique_path` for disk).
fn unique_entry_name(name: &str, used: &mut HashSet<String>) -> String {
    if used.insert(name.to_string()) {
        return name.to_string();
    }
    let path = Path::new(name);
    let stem = path.file_stem().and_then(|s| s.to_str()).unwrap_or(name);
    let ext = path.extension().and_then(|s| s.to_str());
    for n in 1..10_000 {
        let candidate = match ext {
            Some(ext) => format!("{stem} ({n}).{ext}"),
            None => format!("{stem} ({n})"),
        };
        if used.insert(candidate.clone()) {
            return candidate;
        }
    }
    name.to_string()
}
