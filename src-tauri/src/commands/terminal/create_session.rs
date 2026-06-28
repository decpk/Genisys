use std::io::Read;
use std::sync::atomic::Ordering;

use base64::Engine;
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter, Manager, State};
use uuid::Uuid;

use super::default_shell::resolve_default_shell;
use super::spawn_pty::spawn_pty;
use super::state::TerminalManager;
use super::types::{
    CreateTerminalParams, TerminalExitEvent, TerminalOutputEvent, TerminalSession,
};

/// Spawn a PTY-backed shell session, register it, and start streaming its
/// output. A single reader loop fans output out two ways:
///   * the `terminal-output` Tauri event (base64) — consumed by the desktop UI;
///   * the session's broadcast channel (raw bytes) — consumed by remote-terminal
///     mirror clients, and only when at least one is attached.
///
/// Shared by [`cmd_terminal_create`] and the remote-terminal bridge's dedicated
/// sessions so both paths produce byte-for-byte identical sessions (DRY). The
/// desktop output path is unchanged from before this function was extracted.
pub fn spawn_terminal_session(
    app: &AppHandle,
    manager: &TerminalManager,
    params: CreateTerminalParams,
) -> Result<TerminalSession, String> {
    let default = resolve_default_shell();
    let shell = params.shell.unwrap_or(default.shell);
    let args = params.args.unwrap_or(default.args);
    let cols = params.cols.unwrap_or(80);
    let rows = params.rows.unwrap_or(24);

    let id = Uuid::new_v4().to_string();
    let spawned = spawn_pty(
        id.clone(),
        shell.clone(),
        args,
        params.cwd.clone(),
        cols,
        rows,
        params.env,
    )?;

    let meta = spawned.handle.meta.clone();
    let output_tx = spawned.output_tx;
    let history = spawned.history;
    let capture_history = manager.history_capture_handle();
    manager.insert(spawned.handle);

    let app_for_reader = app.clone();
    let id_for_reader = id.clone();

    tauri::async_runtime::spawn_blocking(move || {
        let mut reader = spawned.reader;
        let mut buf = [0u8; 8192];
        loop {
            match reader.read(&mut buf) {
                Ok(0) => break,
                Ok(n) => {
                    let chunk = &buf[..n];
                    // Retain scrollback for remote replay + fan out to mirror
                    // subscribers. While history capture is on (remote sharing
                    // active) we take the history lock around BOTH the append and
                    // the broadcast, so a concurrent remote attach
                    // (`subscribe_with_history`) splits the stream cleanly: every
                    // chunk lands in the replay snapshot xor the live feed. The
                    // common case (no sharing, no LAN client) stays allocation-
                    // free and zero-cost.
                    let has_subs = output_tx.receiver_count() > 0;
                    if capture_history.load(Ordering::Relaxed) {
                        if let Ok(mut hist) = history.lock() {
                            hist.push(chunk.to_vec());
                            if has_subs {
                                let _ = output_tx.send(chunk.to_vec());
                            }
                        } else if has_subs {
                            let _ = output_tx.send(chunk.to_vec());
                        }
                    } else if has_subs {
                        let _ = output_tx.send(chunk.to_vec());
                    }
                    let encoded = base64::engine::general_purpose::STANDARD.encode(chunk);
                    let _ = app_for_reader.emit(
                        "terminal-output",
                        TerminalOutputEvent {
                            id: id_for_reader.clone(),
                            data: encoded,
                        },
                    );
                }
                Err(e) => {
                    if e.kind() == std::io::ErrorKind::Interrupted {
                        continue;
                    }
                    break;
                }
            }
        }
        // PTY closed — emit exit and remove from manager via app state.
        let state = app_for_reader.state::<TerminalManager>();
        state.remove(&id_for_reader);
        let _ = app_for_reader.emit(
            "terminal-exit",
            TerminalExitEvent {
                id: id_for_reader,
                code: None,
            },
        );
    });

    Ok(meta)
}

#[tauri::command]
pub async fn cmd_terminal_create(
    app: AppHandle,
    manager: State<'_, TerminalManager>,
    params: Option<CreateTerminalParams>,
) -> Result<Value, String> {
    let params = params.unwrap_or(CreateTerminalParams {
        cwd: None,
        shell: None,
        args: None,
        cols: None,
        rows: None,
        env: None,
    });

    let meta = spawn_terminal_session(&app, manager.inner(), params)?;

    Ok(json!({
        "success": true,
        "data": {
            "id": meta.id,
            "shell": meta.shell,
            "cwd": meta.cwd,
        }
    }))
}
