use serde_json::json;
use tauri::{Emitter, State};
use whisper_rs::{FullParams, SamplingStrategy, WhisperContextParameters};

use super::whisper_state::{get_model_path, validate_model_name, WhisperState};

#[tauri::command]
pub async fn cmd_whisper_transcribe_chunk(
    app: tauri::AppHandle,
    whisper_state: State<'_, WhisperState>,
    stream_id: String,
    audio_data: Vec<u8>,
    language: Option<String>,
    model_name: Option<String>,
) -> Result<(), String> {
    let model = model_name.unwrap_or_else(|| "base".to_string());
    validate_model_name(&model)?;

    let model_path = get_model_path(&app, &model)?;
    if !model_path.exists() {
        return Err(format!(
            "Model '{}' is not downloaded. Download it first.",
            model
        ));
    }

    // Convert audio bytes to f32 samples (IEEE 754 little-endian, 4 bytes per sample)
    if audio_data.len() % 4 != 0 {
        return Err("Audio data length must be a multiple of 4 bytes (f32 samples)".to_string());
    }
    let samples: Vec<f32> = audio_data
        .chunks_exact(4)
        .map(|chunk| f32::from_le_bytes([chunk[0], chunk[1], chunk[2], chunk[3]]))
        .collect();

    // Store stream_id as active
    {
        let mut active = whisper_state
            .active_stream
            .lock()
            .map_err(|e| format!("Failed to lock active_stream: {}", e))?;
        *active = Some(stream_id.clone());
    }

    // Check if we need to load a different model
    let needs_load = {
        let loaded = whisper_state
            .loaded_model
            .lock()
            .map_err(|e| format!("Failed to lock loaded_model: {}", e))?;
        loaded.as_deref() != Some(&model)
    };

    if needs_load {
        let path = model_path.to_string_lossy().to_string();
        let ctx = tokio::task::spawn_blocking(move || {
            whisper_rs::WhisperContext::new_with_params(&path, WhisperContextParameters::default())
                .map_err(|e| format!("Failed to load whisper model: {}", e))
        })
        .await
        .map_err(|e| format!("Blocking task failed: {}", e))??;

        let mut context_lock = whisper_state
            .context
            .lock()
            .map_err(|e| format!("Failed to lock context: {}", e))?;
        *context_lock = Some(ctx);

        let mut loaded = whisper_state
            .loaded_model
            .lock()
            .map_err(|e| format!("Failed to lock loaded_model: {}", e))?;
        *loaded = Some(model.clone());
    }

    // Clone values needed for the blocking task
    let stream_id_clone = stream_id.clone();
    let app_clone = app.clone();
    let language_clone = language.clone();

    // Extract context for blocking work — we must take it out of the mutex
    // to avoid holding the lock across an await point
    let ctx = {
        let mut context_lock = whisper_state
            .context
            .lock()
            .map_err(|e| format!("Failed to lock context: {}", e))?;
        context_lock
            .take()
            .ok_or_else(|| "Whisper context not available".to_string())?
    };

    let result = tokio::task::spawn_blocking(move || {
        let mut state = ctx
            .create_state()
            .map_err(|e| format!("Failed to create whisper state: {}", e))?;

        let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });

        if let Some(ref lang) = language_clone {
            params.set_language(Some(lang));
        }

        params.set_translate(false);

        let n_threads = std::thread::available_parallelism()
            .map(|n| (n.get() / 2).max(1) as i32)
            .unwrap_or(2);
        params.set_n_threads(n_threads);

        params.set_single_segment(false);

        state
            .full(params, &samples)
            .map_err(|e| format!("Whisper transcription failed: {}", e))?;

        let num_segments = state.full_n_segments();

        for i in 0..num_segments {
            let segment = match state.get_segment(i) {
                Some(segment) => segment,
                None => continue,
            };
            let text = segment
                .to_str_lossy()
                .map_err(|e| format!("Failed to get segment text: {}", e))?;
            let trimmed = text.trim();

            // Filter out hallucinated/non-speech segments
            let lower = trimmed.to_lowercase();
            let is_hallucination =
                trimmed.is_empty()
                || lower.contains("blank_audio")
                || lower.contains("inaudible")
                || lower.contains("indistinct")
                || lower == "thank you."
                || lower == "thanks for watching."
                || lower == "you"
                || lower == "."
                || lower.starts_with('[')
                || lower.starts_with('(');

            if is_hallucination {
                continue;
            }

            let start_ms = segment.start_timestamp() * 10;
            let end_ms = segment.end_timestamp() * 10;

            let _ = app_clone.emit(
                "whisper-chunk",
                json!({
                    "streamId": stream_id_clone,
                    "text": trimmed,
                    "startMs": start_ms,
                    "endMs": end_ms,
                    "isFinal": true,
                }),
            );
        }

        Ok::<whisper_rs::WhisperContext, String>(ctx)
    })
    .await
    .map_err(|e| format!("Blocking task failed: {}", e))?;

    match result {
        Ok(ctx) => {
            // Put the context back
            let mut context_lock = whisper_state
                .context
                .lock()
                .map_err(|e| format!("Failed to lock context: {}", e))?;
            *context_lock = Some(ctx);
        }
        Err(e) => {
            let _ = app.emit(
                "whisper-error",
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
        let mut active = whisper_state
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
pub async fn cmd_whisper_cancel(
    whisper_state: State<'_, WhisperState>,
    stream_id: String,
) -> Result<(), String> {
    let mut active = whisper_state
        .active_stream
        .lock()
        .map_err(|e| format!("Failed to lock active_stream: {}", e))?;

    if active.as_deref() == Some(&stream_id) {
        *active = None;
    }

    Ok(())
}
