use serde::Serialize;

/// Resolved standard user directories used by the Explorer sidebar shortcuts.
///
/// Each field is optional because the corresponding directory may not exist on
/// every platform / user setup (e.g. `Applications` is macOS-only, `Pictures`
/// may be absent on a fresh Linux user).
#[derive(Debug, Serialize)]
pub struct UserDirectories {
    pub home: Option<String>,
    pub desktop: Option<String>,
    pub downloads: Option<String>,
    pub documents: Option<String>,
    pub applications: Option<String>,
    pub pictures: Option<String>,
}

fn path_to_string(p: Option<std::path::PathBuf>) -> Option<String> {
    p.map(|pb| pb.to_string_lossy().into_owned())
}

fn applications_dir() -> Option<String> {
    if cfg!(target_os = "macos") {
        Some("/Applications".to_string())
    } else {
        None
    }
}

/// Returns the user's standard system directories for the Explorer shortcut
/// list. Pure read; no mutation, no IO besides the `dirs` crate's lookups.
#[tauri::command]
pub fn cmd_get_user_directories() -> UserDirectories {
    UserDirectories {
        home: path_to_string(dirs::home_dir()),
        desktop: path_to_string(dirs::desktop_dir()),
        downloads: path_to_string(dirs::download_dir()),
        documents: path_to_string(dirs::document_dir()),
        applications: applications_dir(),
        pictures: path_to_string(dirs::picture_dir()),
    }
}
