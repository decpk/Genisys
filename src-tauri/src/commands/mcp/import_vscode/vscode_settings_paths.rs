use std::path::PathBuf;

/// VS Code variant names for directory lookup.
const VSCODE_VARIANTS: &[&str] = &["Code", "Code - Insiders", "Cursor"];

/// Returns platform-specific paths to VS Code's `settings.json`
/// for all known VS Code variants (Code, Code Insiders, Cursor).
pub fn get_vscode_settings_paths() -> Vec<PathBuf> {
    let home = match dirs::home_dir() {
        Some(h) => h,
        None => return Vec::new(),
    };

    let mut paths = Vec::new();

    for variant in VSCODE_VARIANTS {
        let path = settings_path_for_variant(&home, variant);
        paths.push(path);
    }

    paths
}

/// Build the platform-specific path to settings.json for a given VS Code variant.
fn settings_path_for_variant(home: &PathBuf, variant: &str) -> PathBuf {
    #[cfg(target_os = "macos")]
    {
        home.join("Library")
            .join("Application Support")
            .join(variant)
            .join("User")
            .join("settings.json")
    }

    #[cfg(target_os = "linux")]
    {
        home.join(".config")
            .join(variant)
            .join("User")
            .join("settings.json")
    }

    #[cfg(target_os = "windows")]
    {
        home.join("AppData")
            .join("Roaming")
            .join(variant)
            .join("User")
            .join("settings.json")
    }
}
