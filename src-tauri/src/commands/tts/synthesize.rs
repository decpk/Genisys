use base64::Engine;
use serde_json::{json, Value};
use tauri::{Emitter, State};

use super::tts_state::{
    get_model_file, get_voices_file, get_tokens_file, get_data_dir,
    is_model_downloaded, get_voice_sid, TtsState, AVAILABLE_VOICES,
};

#[tauri::command]
pub async fn cmd_tts_synthesize(
    app: tauri::AppHandle,
    tts_state: State<'_, TtsState>,
    stream_id: String,
    text: String,
    voice: Option<String>,
    speed: Option<f32>,
    _variant: Option<String>,
) -> Result<(), String> {
    if !is_model_downloaded(&app)? {
        return Err("TTS model is not downloaded. Download it first from Settings.".to_string());
    }

    let voice_id = voice.unwrap_or_else(|| "af_heart".to_string());
    let sid = get_voice_sid(&voice_id);
    // length_scale: >1 = slower, <1 = faster. Invert user speed (1.5x speed → 0.67 scale)
    let speech_speed = speed.unwrap_or(1.0).clamp(0.5, 2.0);
    let length_scale = 1.0 / speech_speed;

    // Mark stream as active and reset cancel flag
    {
        let mut active = tts_state
            .active_stream
            .lock()
            .map_err(|e| format!("Failed to lock active_stream: {}", e))?;
        *active = Some(stream_id.clone());

        let mut cancelled = tts_state
            .cancelled
            .lock()
            .map_err(|e| format!("Failed to lock cancelled: {}", e))?;
        *cancelled = false;
    }

    // Ensure engine is loaded
    {
        let engine_guard = tts_state
            .engine
            .lock()
            .map_err(|e| format!("Failed to lock engine: {}", e))?;
        if engine_guard.is_none() {
            drop(engine_guard);

            let model_path = get_model_file(&app)?
                .to_string_lossy()
                .to_string();
            let voices_path = get_voices_file(&app)?
                .to_string_lossy()
                .to_string();
            let tokens_path = get_tokens_file(&app)?
                .to_string_lossy()
                .to_string();
            let data_dir_path = get_data_dir(&app)?
                .to_string_lossy()
                .to_string();

            let config = sherpa_onnx::OfflineTtsConfig {
                model: sherpa_onnx::OfflineTtsModelConfig {
                    kokoro: sherpa_onnx::OfflineTtsKokoroModelConfig {
                        model: Some(model_path),
                        voices: Some(voices_path),
                        tokens: Some(tokens_path),
                        data_dir: if std::path::Path::new(&data_dir_path).exists() {
                            Some(data_dir_path)
                        } else {
                            None
                        },
                        length_scale,
                        ..Default::default()
                    },
                    ..Default::default()
                },
                ..Default::default()
            };

            let engine = sherpa_onnx::OfflineTts::create(&config)
                .ok_or_else(|| "Failed to create TTS engine. Check model files.".to_string())?;

            let mut engine_guard = tts_state
                .engine
                .lock()
                .map_err(|e| format!("Failed to lock engine: {}", e))?;
            *engine_guard = Some(engine);
        }
    }

    let stream_id_clone = stream_id.clone();
    let app_clone = app.clone();

    // Take the engine out for the blocking task (OfflineTts is Send + Sync)
    let engine = {
        let mut engine_guard = tts_state
            .engine
            .lock()
            .map_err(|e| format!("Failed to lock engine: {}", e))?;
        engine_guard
            .take()
            .ok_or_else(|| "TTS engine not available".to_string())?
    };

    let result = tokio::task::spawn_blocking(move || {
        let sentences = split_into_sentences(&text);

        for (idx, sentence) in sentences.iter().enumerate() {
            let trimmed = sentence.trim();
            if trimmed.is_empty() {
                continue;
            }

            let gen_config = sherpa_onnx::GenerationConfig {
                sid,
                ..Default::default()
            };

            let audio = engine
                .generate_with_config(trimmed, &gen_config, None::<fn(&[f32], f32) -> bool>)
                .ok_or_else(|| format!("TTS synthesis failed for: {}", trimmed))?;

            // Convert audio samples to base64 for efficient transmission
            let audio_bytes: Vec<u8> = audio
                .samples()
                .iter()
                .flat_map(|&sample: &f32| sample.to_le_bytes())
                .collect();
            let audio_b64 = base64::engine::general_purpose::STANDARD.encode(&audio_bytes);

            let _ = app_clone.emit(
                "tts-audio-chunk",
                json!({
                    "streamId": stream_id_clone,
                    "audioBase64": audio_b64,
                    "sampleRate": audio.sample_rate(),
                    "chunkIndex": idx,
                    "totalChunks": sentences.len(),
                    "text": trimmed,
                    "isFinal": idx == sentences.len() - 1,
                }),
            );
        }

        Ok::<sherpa_onnx::OfflineTts, String>(engine)
    })
    .await
    .map_err(|e| format!("Blocking task failed: {}", e))?;

    match result {
        Ok(engine) => {
            // Put the engine back
            let mut engine_guard = tts_state
                .engine
                .lock()
                .map_err(|e| format!("Failed to lock engine: {}", e))?;
            *engine_guard = Some(engine);
        }
        Err(e) => {
            let _ = app.emit(
                "tts-error",
                json!({
                    "streamId": stream_id,
                    "error": e,
                }),
            );
            return Err(e);
        }
    }

    // Clear active stream
    {
        let mut active = tts_state
            .active_stream
            .lock()
            .map_err(|e| format!("Failed to lock active_stream: {}", e))?;
        if active.as_deref() == Some(&stream_id) {
            *active = None;
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn cmd_tts_cancel(
    tts_state: State<'_, TtsState>,
    stream_id: String,
) -> Result<(), String> {
    let mut active = tts_state
        .active_stream
        .lock()
        .map_err(|e| format!("Failed to lock active_stream: {}", e))?;

    if active.as_deref() == Some(&stream_id) {
        *active = None;

        let mut cancelled = tts_state
            .cancelled
            .lock()
            .map_err(|e| format!("Failed to lock cancelled: {}", e))?;
        *cancelled = true;
    }

    Ok(())
}

#[tauri::command]
pub async fn cmd_tts_list_voices() -> Result<Value, String> {
    let voices: Vec<Value> = AVAILABLE_VOICES
        .iter()
        .map(|(id, _sid, label)| {
            json!({
                "id": id,
                "label": label,
            })
        })
        .collect();

    Ok(json!({ "voices": voices }))
}

fn split_into_sentences(text: &str) -> Vec<String> {
    let mut sentences = Vec::new();
    let mut current = String::new();

    for ch in text.chars() {
        current.push(ch);
        if ch == '.' || ch == '!' || ch == '?' || ch == '\n' {
            let trimmed = current.trim().to_string();
            if !trimmed.is_empty() {
                sentences.push(trimmed);
            }
            current.clear();
        }
    }

    let trimmed = current.trim().to_string();
    if !trimmed.is_empty() {
        sentences.push(trimmed);
    }

    if sentences.is_empty() {
        sentences.push(text.to_string());
    }

    sentences
}
