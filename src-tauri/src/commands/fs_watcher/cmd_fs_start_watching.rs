use crate::commands::err_val;
use notify::RecursiveMode;
use notify_debouncer_mini::{new_debouncer, DebounceEventResult};
use serde_json::{json, Value};
use std::path::PathBuf;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};

use super::state::{
    build_gitignore, classify, is_excluded, registry, WatcherState, DEBOUNCE_MS,
    SELF_WRITE_WINDOW_MS,
};

#[tauri::command]
pub async fn cmd_fs_start_watching(app: AppHandle, root_path: String) -> Value {
    let root = PathBuf::from(&root_path);
    if !root.exists() {
        return err_val(format!("path does not exist: {root_path}"));
    }
    {
        let reg = registry().lock().expect("fs watcher registry poisoned");
        if reg.contains_key(&root_path) {
            return json!({ "success": true, "data": { "status": "already-watching" } });
        }
    }

    let gitignore = build_gitignore(&root);
    let root_for_cb = root.clone();
    let root_str = root_path.clone();
    let app_clone = app.clone();

    let mut debouncer = match new_debouncer(
        Duration::from_millis(DEBOUNCE_MS),
        move |res: DebounceEventResult| {
            let events = match res {
                Ok(evts) => evts,
                Err(_) => return,
            };
            // Self-write suppression
            let mut should_skip = false;
            if let Ok(reg) = registry().lock() {
                if let Some(state) = reg.get(&root_str) {
                    if state.last_self_write.elapsed().as_millis() < SELF_WRITE_WINDOW_MS {
                        should_skip = true;
                    }
                }
            }
            if should_skip {
                return;
            }

            // Classify and filter
            let mut kind: &'static str = "workdir";
            let mut workdir_paths: Vec<String> = Vec::new();
            let mut saw_meta = false;
            for ev in events {
                let p = ev.path.clone();
                let rel = p.strip_prefix(&root_for_cb).unwrap_or(&p);
                let rel_str = rel.to_string_lossy().to_string();
                let class = match classify(&p) {
                    Some(c) => c,
                    None => continue,
                };
                if class != "workdir" {
                    saw_meta = true;
                    kind = class;
                    continue;
                }
                if is_excluded(&rel_str) {
                    continue;
                }
                if gitignore.matched(&p, p.is_dir()).is_ignore() {
                    continue;
                }
                workdir_paths.push(p.to_string_lossy().to_string());
            }
            if !saw_meta && workdir_paths.is_empty() {
                return;
            }
            let _ = app_clone.emit(
                "fs-change",
                json!({
                    "rootPath": root_str,
                    "kind": kind,
                    "changedPaths": workdir_paths,
                }),
            );
        },
    ) {
        Ok(d) => d,
        Err(e) => return err_val(format!("failed to create watcher: {e}")),
    };

    if let Err(e) = debouncer.watcher().watch(&root, RecursiveMode::Recursive) {
        return err_val(format!("failed to watch path: {e}"));
    }

    let mut reg = registry().lock().expect("fs watcher registry poisoned");
    reg.insert(
        root_path.clone(),
        WatcherState {
            _debouncer: debouncer,
            last_self_write: Instant::now() - Duration::from_secs(60),
        },
    );
    json!({ "success": true, "data": { "status": "started" } })
}
