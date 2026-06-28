use crate::commands::err_val;
use serde_json::Value;
use std::fs;
use std::path::PathBuf;

const MAX_CONTENT_BYTES: usize = 16 * 1024 * 1024;

#[tauri::command]
pub async fn cmd_write_local_file_content(
    root_path: String,
    file_path: String,
    content: String,
) -> Value {
    if content.len() > MAX_CONTENT_BYTES {
        return err_val("Content too large (>16MB)");
    }

    let root = PathBuf::from(&root_path);
    let target = root.join(file_path.trim_start_matches('/'));

    // ── Path-traversal guard: canonicalize the parent and require it to
    //    stay inside the canonicalized root. We canonicalize the parent
    //    (which must already exist for the write to succeed) rather than
    //    the target file itself, which may not exist yet.
    let parent = match target.parent() {
        Some(p) => p,
        None => return err_val("Invalid target path"),
    };

    let canonical_root = match fs::canonicalize(&root) {
        Ok(p) => p,
        Err(e) => return err_val(e),
    };
    let canonical_parent = match fs::canonicalize(parent) {
        Ok(p) => p,
        Err(e) => return err_val(e),
    };

    if !canonical_parent.starts_with(&canonical_root) {
        return err_val("Path is outside workspace root");
    }

    // ── Atomic write: write to <file>.tmp then rename onto the target.
    let mut tmp = target.clone();
    let tmp_name = match target.file_name() {
        Some(name) => {
            let mut s = name.to_os_string();
            s.push(".tmp");
            s
        }
        None => return err_val("Invalid target filename"),
    };
    tmp.set_file_name(tmp_name);

    if let Err(e) = fs::write(&tmp, content.as_bytes()) {
        let _ = fs::remove_file(&tmp);
        return err_val(e);
    }

    if let Err(e) = fs::rename(&tmp, &target) {
        let _ = fs::remove_file(&tmp);
        return err_val(e);
    }

    serde_json::json!({ "success": true })
}
