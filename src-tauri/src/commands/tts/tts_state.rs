use std::path::PathBuf;
use std::sync::Mutex as StdMutex;
use sherpa_onnx::OfflineTts;
use tauri::Manager;

pub const AVAILABLE_VOICES: &[(&str, i32, &str)] = &[
    ("af_heart", 0, "Heart (EN-US, Female)"),
    ("af_bella", 1, "Bella (EN-US, Female)"),
    ("af_nicole", 2, "Nicole (EN-US, Female)"),
    ("af_sarah", 3, "Sarah (EN-US, Female)"),
    ("af_sky", 4, "Sky (EN-US, Female)"),
    ("am_adam", 5, "Adam (EN-US, Male)"),
    ("am_michael", 6, "Michael (EN-US, Male)"),
    ("bf_emma", 7, "Emma (EN-UK, Female)"),
    ("bf_isabella", 8, "Isabella (EN-UK, Female)"),
    ("bm_george", 9, "George (EN-UK, Male)"),
    ("bm_lewis", 10, "Lewis (EN-UK, Male)"),
];

pub struct TtsState {
    pub engine: StdMutex<Option<OfflineTts>>,
    pub active_stream: StdMutex<Option<String>>,
    pub cancelled: StdMutex<bool>,
}

impl TtsState {
    pub fn new() -> Self {
        Self {
            engine: StdMutex::new(None),
            active_stream: StdMutex::new(None),
            cancelled: StdMutex::new(false),
        }
    }
}

pub fn get_tts_models_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    Ok(data_dir.join("tts-models"))
}

pub fn get_kokoro_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = get_tts_models_dir(app)?;
    Ok(dir.join("kokoro-en"))
}

pub fn get_model_file(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(get_kokoro_dir(app)?.join("model.int8.onnx"))
}

pub fn get_voices_file(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(get_kokoro_dir(app)?.join("voices.bin"))
}

pub fn get_tokens_file(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(get_kokoro_dir(app)?.join("tokens.txt"))
}

pub fn get_data_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(get_kokoro_dir(app)?.join("espeak-ng-data"))
}

pub fn is_model_downloaded(app: &tauri::AppHandle) -> Result<bool, String> {
    let model = get_model_file(app)?;
    let voices = get_voices_file(app)?;
    let tokens = get_tokens_file(app)?;
    Ok(model.exists() && voices.exists() && tokens.exists())
}

pub fn get_voice_sid(voice_id: &str) -> i32 {
    AVAILABLE_VOICES
        .iter()
        .find(|(id, _, _)| *id == voice_id)
        .map(|(_, sid, _)| *sid)
        .unwrap_or(0)
}
