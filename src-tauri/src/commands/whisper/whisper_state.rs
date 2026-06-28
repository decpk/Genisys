use std::path::PathBuf;
use std::sync::Mutex as StdMutex;
use tauri::Manager;
use whisper_rs::WhisperContext;

pub const HUGGINGFACE_BASE_URL: &str =
    "https://huggingface.co/ggerganov/whisper.cpp/resolve/main";

pub const VALID_MODEL_NAMES: &[&str] = &["tiny", "base", "small", "medium", "large"];

pub struct WhisperState {
    pub context: StdMutex<Option<WhisperContext>>,
    pub active_stream: StdMutex<Option<String>>,
    pub loaded_model: StdMutex<Option<String>>,
}

impl WhisperState {
    pub fn new() -> Self {
        Self {
            context: StdMutex::new(None),
            active_stream: StdMutex::new(None),
            loaded_model: StdMutex::new(None),
        }
    }
}

pub fn validate_model_name(name: &str) -> Result<(), String> {
    if VALID_MODEL_NAMES.contains(&name) {
        Ok(())
    } else {
        Err(format!(
            "Invalid model name '{}'. Valid names: {}",
            name,
            VALID_MODEL_NAMES.join(", ")
        ))
    }
}

pub fn get_models_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    Ok(data_dir.join("whisper-models"))
}

pub fn get_model_path(app: &tauri::AppHandle, model_name: &str) -> Result<PathBuf, String> {
    let dir = get_models_dir(app)?;
    Ok(dir.join(format!("ggml-{}.bin", model_name)))
}

pub fn get_model_download_url(model_name: &str) -> String {
    let download_name = match model_name {
        "large" => "large-v3",
        other => other,
    };
    format!("{}/ggml-{}.bin", HUGGINGFACE_BASE_URL, download_name)
}
