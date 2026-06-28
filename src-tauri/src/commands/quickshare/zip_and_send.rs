//! `cmd_quickshare_zip_and_send` — bundle every shared file in the tray into a
//! single `.zip` and drop it into the tray addressed to one device (or
//! "everyone"). The recipient then receives it over the existing download /
//! auto-pull path, exactly like any other shared file.

use serde_json::{json, Value};
use tauri::{AppHandle, State};

use super::events::fan_out_tray;
use super::state::QuickShareManager;
use super::types::{TrayItem, HOST_SENDER_ID, TARGET_EVERYONE};
use super::util::unique_path;
use super::zip_bundle::build_zip;

const DESKTOP_LABEL: &str = "This device";

#[tauri::command]
pub async fn cmd_quickshare_zip_and_send(
    app: AppHandle,
    manager: State<'_, QuickShareManager>,
    target: Option<String>,
) -> Result<Value, String> {
    let storage_dir = match manager.storage_dir() {
        Some(d) => d,
        None => return Ok(json!({ "success": false, "error": "QuickShare is not running" })),
    };
    let target = target.unwrap_or_else(|| TARGET_EVERYONE.to_string());

    // Every file item currently in the tray (the host sees them all), minus text
    // snippets and any previously generated bundle (so we never nest one zip
    // inside the next).
    let files: Vec<TrayItem> = manager
        .snapshot_items()
        .into_iter()
        .filter(|i| i.kind == "file" && i.local_path.is_some() && !is_generated_bundle(i))
        .collect();
    if files.is_empty() {
        return Ok(json!({ "success": false, "error": "No files to bundle" }));
    }

    let dir = std::path::Path::new(&storage_dir);
    let zip_name = format!("QuickShare-{}.zip", chrono::Utc::now().format("%Y%m%d-%H%M%S"));
    let dest = unique_path(dir, &zip_name);

    let build_dest = dest.clone();
    let summary = tokio::task::spawn_blocking(move || build_zip(&files, &build_dest, false))
        .await
        .map_err(|e| format!("zip task failed: {e}"))?
        .map_err(|e| format!("zip failed: {e}"))?;

    if summary.files == 0 {
        let _ = std::fs::remove_file(&dest);
        return Ok(json!({ "success": false, "error": "No files to bundle" }));
    }

    let name = dest
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("QuickShare.zip")
        .to_string();
    let item = TrayItem::new_file(
        name.clone(),
        summary.size,
        "application/zip".to_string(),
        DESKTOP_LABEL.to_string(),
        HOST_SENDER_ID.to_string(),
        target.clone(),
        dest.to_string_lossy().to_string(),
    );
    manager.add_item(item);
    fan_out_tray(&app, manager.inner());

    Ok(json!({
        "success": true,
        "data": { "name": name, "size": summary.size, "files": summary.files, "target": target }
    }))
}

/// Whether a tray item is a bundle this command previously produced — used to
/// avoid zipping a QuickShare archive into the next one.
fn is_generated_bundle(item: &TrayItem) -> bool {
    item.mime == "application/zip"
        && item.name.starts_with("QuickShare-")
        && item.name.ends_with(".zip")
}
