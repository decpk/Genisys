use crate::types::BrowserBookmark;
use serde_json::Value;
use std::fs;

/// Recursively walk a Chromium bookmark node, collecting URL leaves.
/// `folder_path` is the "/"-joined chain of ancestor folder names.
fn walk_node(node: &Value, folder_path: &str, out: &mut Vec<BrowserBookmark>) {
    let node_type = node.get("type").and_then(Value::as_str).unwrap_or("");
    if node_type == "url" {
        let title = node.get("name").and_then(Value::as_str).unwrap_or("").to_string();
        let url = node.get("url").and_then(Value::as_str).unwrap_or("").to_string();
        if !url.is_empty() {
            out.push(BrowserBookmark { title, url, folder_path: folder_path.to_string() });
        }
        return;
    }
    if node_type == "folder" {
        let name = node.get("name").and_then(Value::as_str).unwrap_or("");
        let child_path = if folder_path.is_empty() {
            name.to_string()
        } else if name.is_empty() {
            folder_path.to_string()
        } else {
            format!("{folder_path}/{name}")
        };
        if let Some(children) = node.get("children").and_then(Value::as_array) {
            for child in children {
                walk_node(child, &child_path, out);
            }
        }
    }
}

pub fn parse_chromium_bookmarks(path: &str) -> Result<Vec<BrowserBookmark>, String> {
    let contents =
        fs::read_to_string(path).map_err(|e| format!("Failed to read bookmarks file: {e}"))?;
    let root: Value =
        serde_json::from_str(&contents).map_err(|e| format!("Failed to parse bookmarks JSON: {e}"))?;

    let mut out: Vec<BrowserBookmark> = Vec::new();
    if let Some(roots) = root.get("roots").and_then(Value::as_object) {
        for key in ["bookmark_bar", "other", "synced"] {
            if let Some(node) = roots.get(key) {
                walk_node(node, "", &mut out);
            }
        }
    }
    Ok(out)
}
