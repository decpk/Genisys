use futures_util::StreamExt;
use serde_json::{json, Value};
use std::fs;
use tauri::Emitter;

use super::whisper_state::{
    get_model_download_url, get_model_path, get_models_dir, validate_model_name, VALID_MODEL_NAMES,
};

#[tauri::command]
pub async fn cmd_whisper_download_model(
    app: tauri::AppHandle,
    model_name: String,
) -> Result<Value, String> {
    validate_model_name(&model_name)?;

    let models_dir = get_models_dir(&app)?;
    fs::create_dir_all(&models_dir)
        .map_err(|e| format!("Failed to create models directory: {}", e))?;

    let model_path = get_model_path(&app, &model_name)?;
    if model_path.exists() {
        return Ok(json!({ "status": "already_exists", "path": model_path.to_string_lossy() }));
    }

    let url = get_model_download_url(&model_name);
    let client = reqwest::Client::builder()
        .connect_timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to start download: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Download failed with status: {}",
            response.status()
        ));
    }

    let total_bytes = response.content_length().unwrap_or(0);
    let mut downloaded_bytes: u64 = 0;

    let temp_path = model_path.with_extension("bin.part");
    let mut file = fs::File::create(&temp_path)
        .map_err(|e| format!("Failed to create temp file: {}", e))?;

    let mut stream = response.bytes_stream();

    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| {
            let _ = fs::remove_file(&temp_path);
            format!("Download stream error: {}", e)
        })?;
        std::io::Write::write_all(&mut file, &chunk).map_err(|e| {
            let _ = fs::remove_file(&temp_path);
            format!("Failed to write chunk: {}", e)
        })?;

        downloaded_bytes += chunk.len() as u64;
        let percent = if total_bytes > 0 {
            (downloaded_bytes as f64 / total_bytes as f64 * 100.0) as u32
        } else {
            0
        };

        let _ = app.emit(
            "whisper-model-download-progress",
            json!({
                "modelName": model_name,
                "downloadedBytes": downloaded_bytes,
                "totalBytes": total_bytes,
                "percent": percent,
            }),
        );
    }

    fs::rename(&temp_path, &model_path)
        .map_err(|e| format!("Failed to finalize downloaded file: {}", e))?;

    let _ = app.emit(
        "whisper-model-download-done",
        json!({ "modelName": model_name }),
    );

    Ok(json!({
        "status": "downloaded",
        "path": model_path.to_string_lossy(),
        "size": downloaded_bytes,
    }))
}

#[tauri::command]
pub async fn cmd_whisper_list_models(app: tauri::AppHandle) -> Result<Value, String> {
    let models_dir = get_models_dir(&app)?;
    let mut models: Vec<Value> = Vec::new();

    for &name in VALID_MODEL_NAMES {
        let model_path = get_model_path(&app, name)?;
        if model_path.exists() {
            let metadata = fs::metadata(&model_path)
                .map_err(|e| format!("Failed to read metadata for {}: {}", name, e))?;
            models.push(json!({
                "name": name,
                "size": metadata.len(),
                "path": model_path.to_string_lossy(),
                "downloaded": true,
            }));
        } else {
            models.push(json!({
                "name": name,
                "size": 0,
                "path": model_path.to_string_lossy(),
                "downloaded": false,
            }));
        }
    }

    Ok(json!({ "models": models }))
}

#[tauri::command]
pub async fn cmd_whisper_delete_model(
    app: tauri::AppHandle,
    model_name: String,
) -> Result<Value, String> {
    validate_model_name(&model_name)?;

    let model_path = get_model_path(&app, &model_name)?;
    if !model_path.exists() {
        return Err(format!("Model '{}' is not downloaded", model_name));
    }

    fs::remove_file(&model_path)
        .map_err(|e| format!("Failed to delete model '{}': {}", model_name, e))?;

    Ok(json!({ "status": "deleted", "modelName": model_name }))
}
