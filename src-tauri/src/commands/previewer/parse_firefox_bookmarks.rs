use crate::types::BrowserBookmark;
use rusqlite::Connection;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

/// Load all Firefox folders as `id -> (title, parent_id)`. Best-effort: returns
/// an empty map on any query error so bookmark import still succeeds — it just
/// produces empty folder paths (the pre-folder-preservation behavior).
fn load_firefox_folders(conn: &Connection) -> HashMap<i64, (String, i64)> {
    let mut map: HashMap<i64, (String, i64)> = HashMap::new();
    let Ok(mut stmt) =
        conn.prepare("SELECT id, COALESCE(title,''), parent FROM moz_bookmarks WHERE type = 2")
    else {
        return map;
    };
    let Ok(rows) = stmt.query_map([], |row| {
        Ok((
            row.get::<_, i64>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, i64>(2)?,
        ))
    }) else {
        return map;
    };
    for row in rows.flatten() {
        map.insert(row.0, (row.1, row.2));
    }
    map
}

/// Resolve the immediate (leaf) user-folder name for a bookmark's parent folder.
/// Top-level containers (Bookmarks Toolbar/Menu/Other — whose parent is the
/// places root) resolve to `""` so only real user folders are reported.
fn immediate_folder_name(
    folders: &HashMap<i64, (String, i64)>,
    parent: i64,
    root_id: Option<i64>,
) -> String {
    match folders.get(&parent) {
        Some((title, grandparent)) => {
            if Some(*grandparent) == root_id {
                String::new()
            } else {
                title.clone()
            }
        }
        None => String::new(),
    }
}

/// Open the (temp copy of the) Firefox places DB and read bookmark rows.
fn read_firefox_bookmarks(temp_path: &Path) -> Result<Vec<BrowserBookmark>, String> {
    let conn =
        Connection::open(temp_path).map_err(|e| format!("Failed to open Firefox database: {e}"))?;

    let folders = load_firefox_folders(&conn);
    // The places root is the folder whose parent is 0.
    let root_id = folders
        .iter()
        .find(|(_, (_, parent))| *parent == 0)
        .map(|(id, _)| *id);

    let mut stmt = conn
        .prepare(
            "SELECT COALESCE(b.title,''), p.url, b.parent \
             FROM moz_bookmarks b JOIN moz_places p ON b.fk = p.id \
             WHERE b.type = 1 AND p.url LIKE 'http%'",
        )
        .map_err(|e| format!("Failed to query Firefox bookmarks: {e}"))?;
    let rows = stmt
        .query_map([], |row| {
            let title: String = row.get(0)?;
            let url: String = row.get(1)?;
            let parent: i64 = row.get(2)?;
            Ok((title, url, parent))
        })
        .map_err(|e| format!("Failed to read Firefox bookmarks: {e}"))?;

    let mut out: Vec<BrowserBookmark> = Vec::new();
    for row in rows {
        match row {
            Ok((title, url, parent)) => {
                let folder_path = immediate_folder_name(&folders, parent, root_id);
                out.push(BrowserBookmark { title, url, folder_path });
            }
            Err(e) => return Err(format!("Failed to map Firefox row: {e}")),
        }
    }
    Ok(out)
}

pub fn parse_firefox_bookmarks(path: &str) -> Result<Vec<BrowserBookmark>, String> {
    // Copy the live `places.sqlite` to a temp file first — a running Firefox
    // holds a lock on the original, so reading it directly can fail with "busy".
    let temp_path =
        std::env::temp_dir().join(format!("genisys_places_{}.sqlite", uuid::Uuid::new_v4()));
    fs::copy(path, &temp_path).map_err(|e| format!("Failed to copy Firefox database: {e}"))?;

    let result = read_firefox_bookmarks(&temp_path);
    let _ = fs::remove_file(&temp_path);
    result
}
