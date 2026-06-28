use crate::types::*;
use std::fs;
use std::path::{Path, PathBuf};

const DATA_DIR_NAME: &str = ".genisys-data";

pub fn get_data_dir() -> PathBuf {
    let base = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
    base.join("com.genisys.app").join(DATA_DIR_NAME)
}

pub fn ensure_data_dir() {
    fs::create_dir_all(get_data_dir()).ok();
}

pub fn get_db_path() -> String {
    get_data_dir().join("genisys.db").to_string_lossy().to_string()
}

fn manifest_path() -> PathBuf { get_data_dir().join("projects.json") }
fn project_dir(project_id: &str) -> PathBuf { get_data_dir().join("projects").join(project_id) }
fn project_settings_path(project_id: &str) -> PathBuf { project_dir(project_id).join("settings.json") }

pub fn load_manifest() -> ProjectsManifest {
    let path = manifest_path();
    if path.exists() {
        fs::read_to_string(&path).ok()
            .and_then(|data| serde_json::from_str(&data).ok())
            .unwrap_or(ProjectsManifest { active_project_id: None, projects: vec![] })
    } else {
        ProjectsManifest { active_project_id: None, projects: vec![] }
    }
}

pub fn save_manifest(manifest: &ProjectsManifest) {
    write_json_file(&manifest_path(), manifest);
}

pub fn load_settings(project_id: &str) -> ProjectSettings {
    let path = project_settings_path(project_id);
    if path.exists() {
        fs::read_to_string(&path).ok()
            .and_then(|data| serde_json::from_str(&data).ok())
            .unwrap_or_default()
    } else {
        ProjectSettings::default()
    }
}

pub fn save_settings(project_id: &str, settings: &ProjectSettings) {
    fs::create_dir_all(project_dir(project_id)).ok();
    write_json_file(&project_settings_path(project_id), settings);
}

fn write_json_file<T: serde::Serialize>(path: &Path, data: &T) {
    if let Some(parent) = path.parent() { fs::create_dir_all(parent).ok(); }
    fs::write(path, serde_json::to_string_pretty(data).unwrap_or_default()).ok();
}
