use futures_util::StreamExt;
use serde_json::{json, Value};
use std::fs;
use tauri::Emitter;

use super::tts_state::{
    get_kokoro_dir, get_tts_models_dir, is_model_downloaded,
};

/// GitHub release URL for the Kokoro int8 English model (smallest, ~98 MB)
const KOKORO_TAR_URL: &str =
    "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-int8-en-v0_19.tar.bz2";

/// The folder name inside the tar archive
const KOKORO_ARCHIVE_DIR: &str = "kokoro-int8-en-v0_19";

#[tauri::command]
pub async fn cmd_tts_download_model(
    app: tauri::AppHandle,
    variant: String,
) -> Result<Value, String> {
    if is_model_downloaded(&app)? {
        return Ok(json!({ "status": "already_exists" }));
    }

    let models_dir = get_tts_models_dir(&app)?;
    fs::create_dir_all(&models_dir)
        .map_err(|e| format!("Failed to create TTS models directory: {}", e))?;

    let tar_dest = models_dir.join("kokoro-int8-en-v0_19.tar.bz2");

    // Download the tar.bz2 archive
    download_file_with_progress(&app, KOKORO_TAR_URL, &tar_dest, "kokoro-int8-en")
        .await?;

    // Extract using system tar (available on macOS and Linux)
    let status = std::process::Command::new("tar")
        .args(["xjf", &tar_dest.to_string_lossy(), "-C", &models_dir.to_string_lossy()])
        .status()
        .map_err(|e| format!("Failed to run tar: {}", e))?;

    if !status.success() {
        let _ = fs::remove_file(&tar_dest);
        return Err("Failed to extract model archive".to_string());
    }

    // Clean up the archive
    let _ = fs::remove_file(&tar_dest);

    // Rename extracted folder to our expected name if different
    let extracted_dir = models_dir.join(KOKORO_ARCHIVE_DIR);
    let kokoro_dir = get_kokoro_dir(&app)?;
    if extracted_dir != kokoro_dir && extracted_dir.exists() {
        fs::rename(&extracted_dir, &kokoro_dir)
            .map_err(|e| format!("Failed to rename model directory: {}", e))?;
    }

    let _ = app.emit(
        "tts-model-download-done",
        json!({ "variant": variant }),
    );

    Ok(json!({
        "status": "downloaded",
        "path": kokoro_dir.to_string_lossy(),
    }))
}

#[tauri::command]
pub async fn cmd_tts_list_models(app: tauri::AppHandle) -> Result<Value, String> {
    let downloaded = is_model_downloaded(&app)?;
    let kokoro_dir = get_kokoro_dir(&app)?;

    let size = if downloaded {
        // Sum up all file sizes in the kokoro directory
        let mut total: u64 = 0;
        if let Ok(entries) = fs::read_dir(&kokoro_dir) {
            for entry in entries.flatten() {
                if let Ok(meta) = entry.metadata() {
                    if meta.is_file() {
                        total += meta.len();
                    }
                }
            }
        }
        total
    } else {
        0
    };

    let models = vec![json!({
        "variant": "kokoro-en",
        "size": size,
        "path": kokoro_dir.to_string_lossy(),
        "downloaded": downloaded,
    })];

    Ok(json!({
        "models": models,
        "voicesDownloaded": downloaded,
    }))
}

#[tauri::command]
pub async fn cmd_tts_delete_model(
    app: tauri::AppHandle,
    variant: String,
) -> Result<Value, String> {
    let kokoro_dir = get_kokoro_dir(&app)?;
    if !kokoro_dir.exists() {
        return Err("TTS model is not downloaded".to_string());
    }

    fs::remove_dir_all(&kokoro_dir)
        .map_err(|e| format!("Failed to delete TTS model: {}", e))?;

    Ok(json!({ "status": "deleted", "variant": variant }))
}

async fn download_file_with_progress(
    app: &tauri::AppHandle,
    url: &str,
    dest: &std::path::Path,
    label: &str,
) -> Result<(), String> {
    let client = reqwest::Client::builder()
        .connect_timeout(std::time::Duration::from_secs(30))
        .user_agent("Genisys/1.0")
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Failed to start download for {}: {}", label, e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Download failed for {} with status: {} (URL: {})",
            label,
            response.status(),
            url,
        ));
    }

    let total_bytes = response.content_length().unwrap_or(0);
    let mut downloaded_bytes: u64 = 0;

    let temp_path = dest.with_extension("part");
    let mut file = fs::File::create(&temp_path)
        .map_err(|e| format!("Failed to create temp file for {}: {}", label, e))?;

    let mut stream = response.bytes_stream();

    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| {
            let _ = fs::remove_file(&temp_path);
            format!("Download stream error for {}: {}", label, e)
        })?;
        std::io::Write::write_all(&mut file, &chunk).map_err(|e| {
            let _ = fs::remove_file(&temp_path);
            format!("Failed to write chunk for {}: {}", label, e)
        })?;

        downloaded_bytes += chunk.len() as u64;
        let percent = if total_bytes > 0 {
            (downloaded_bytes as f64 / total_bytes as f64 * 100.0) as u32
        } else {
            0
        };

        let _ = app.emit(
            "tts-model-download-progress",
            json!({
                "label": label,
                "downloadedBytes": downloaded_bytes,
                "totalBytes": total_bytes,
                "percent": percent,
            }),
        );
    }

    fs::rename(&temp_path, dest)
        .map_err(|e| format!("Failed to finalize download for {}: {}", label, e))?;

    Ok(())
}
