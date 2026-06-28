use crate::types::BrowserBookmark;
use plist::Value;

const PERMISSION_HINT: &str =
    "Safari bookmarks require Full Disk Access. Grant it in System Settings → Privacy & Security → Full Disk Access, then retry.";

/// Recursively walk a Safari bookmarks plist node, collecting leaf bookmarks.
/// `folder_path` is the "/"-joined chain of ancestor list (folder) titles.
fn walk_node(node: &Value, folder_path: &str, out: &mut Vec<BrowserBookmark>) {
    let dict = match node.as_dictionary() {
        Some(dict) => dict,
        None => return,
    };
    let kind = dict.get("WebBookmarkType").and_then(Value::as_string).unwrap_or("");

    if kind == "WebBookmarkTypeLeaf" {
        let url = dict.get("URLString").and_then(Value::as_string).unwrap_or("").to_string();
        if url.is_empty() {
            return;
        }
        let title = dict
            .get("URIDictionary")
            .and_then(Value::as_dictionary)
            .and_then(|d| d.get("title"))
            .and_then(Value::as_string)
            .unwrap_or(&url)
            .to_string();
        out.push(BrowserBookmark { title, url, folder_path: folder_path.to_string() });
        return;
    }

    if kind == "WebBookmarkTypeList" {
        let name = dict.get("Title").and_then(Value::as_string).unwrap_or("");
        let child_path = if folder_path.is_empty() {
            name.to_string()
        } else if name.is_empty() {
            folder_path.to_string()
        } else {
            format!("{folder_path}/{name}")
        };
        if let Some(children) = dict.get("Children").and_then(Value::as_array) {
            for child in children {
                walk_node(child, &child_path, out);
            }
        }
    }
}

pub fn parse_safari_bookmarks(path: &str) -> Result<Vec<BrowserBookmark>, String> {
    let root = Value::from_file(path).map_err(|e| {
        let msg = e.to_string();
        if msg.contains("Operation not permitted") || msg.contains("Permission denied") {
            PERMISSION_HINT.to_string()
        } else {
            format!("Failed to read Safari bookmarks: {msg}")
        }
    })?;

    let mut out: Vec<BrowserBookmark> = Vec::new();
    if let Some(dict) = root.as_dictionary() {
        if let Some(children) = dict.get("Children").and_then(Value::as_array) {
            for child in children {
                walk_node(child, "", &mut out);
            }
        }
    }
    Ok(out)
}
