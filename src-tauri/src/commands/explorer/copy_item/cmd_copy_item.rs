use std::fs;
use std::path::PathBuf;
use std::time::{Duration, Instant};

use serde_json::Value;
use tauri::Emitter;

use super::compute_copy_total::compute_copy_total;
use super::copy_accumulator::CopyAccumulator;
use super::copy_progress::CopyProgressPayload;
use super::copy_with_progress::copy_with_progress;

#[tauri::command]
pub async fn cmd_copy_item(
    root_path: String,
    source: String,
    destination: String,
    source_root: Option<String>,
    operation_id: Option<String>,
    window: tauri::Window,
) -> Value {
    // Destination root (where the item is pasted into).
    let root = match PathBuf::from(&root_path).canonicalize() {
        Ok(r) => r,
        Err(e) => return crate::commands::err_val(format!("Invalid root path: {e}")),
    };

    // Source root may differ from the destination root (cross-root paste).
    // Defaults to the destination root when not provided.
    let src_root = match source_root.as_deref() {
        Some(sr) => match PathBuf::from(sr).canonicalize() {
            Ok(r) => r,
            Err(e) => return crate::commands::err_val(format!("Invalid source root path: {e}")),
        },
        None => root.clone(),
    };

    let src_cleaned = source.trim_start_matches('/').trim_start_matches("./");
    let dst_cleaned = destination.trim_start_matches('/').trim_start_matches("./");

    if src_cleaned.is_empty() || dst_cleaned.is_empty() {
        return crate::commands::err_val("Paths cannot be empty");
    }

    let src_full = src_root.join(src_cleaned);
    let dst_full = root.join(dst_cleaned);

    // Verify source is within its own root
    let src_canon = match src_full.canonicalize() {
        Ok(c) => c,
        Err(e) => return crate::commands::err_val(format!("Source not found: {e}")),
    };
    if !src_canon.starts_with(&src_root) || src_canon == src_root {
        return crate::commands::err_val("Path traversal blocked on source");
    }

    // Verify destination parent is within the destination root
    if let Some(parent) = dst_full.parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                return crate::commands::err_val(format!(
                    "Failed to create destination directory: {e}"
                ));
            }
        }
        match parent.canonicalize() {
            Ok(canon_parent) if canon_parent.starts_with(&root) => {}
            _ => return crate::commands::err_val("Path traversal blocked on destination"),
        }
    }

    if dst_full.exists() {
        return crate::commands::err_val(format!("Destination already exists: {dst_cleaned}"));
    }

    let (total_bytes, total_files) = compute_copy_total(&src_canon);

    let mut acc = CopyAccumulator {
        operation_id: operation_id.clone().unwrap_or_default(),
        total_bytes,
        copied_bytes: 0,
        total_files,
        files_done: 0,
        // Initialize in the past so the first event fires immediately.
        last_emit: Instant::now() - Duration::from_millis(100),
    };

    if let Err(e) = copy_with_progress(&window, &mut acc, &src_canon, &dst_full) {
        return crate::commands::err_val(e);
    }

    // Emit a final payload signalling completion. Skipped when no operation_id
    // was provided to avoid event noise.
    if let Some(id) = operation_id.as_deref() {
        if !id.is_empty() {
            let payload = CopyProgressPayload {
                operation_id: id.to_string(),
                total_bytes,
                copied_bytes: total_bytes,
                total_files,
                files_done: total_files,
                current_file: String::new(),
                done: true,
            };
            let _ = window.emit("explorer-copy-progress", &payload);
        }
    }

    serde_json::json!({"success": true, "from": src_cleaned, "to": dst_cleaned, "filesCopied": total_files})
}
