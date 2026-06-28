use std::collections::HashMap;
use std::io::Read;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use portable_pty::{native_pty_system, CommandBuilder, PtySize};

use super::state::{OutputHistory, SessionHandle};
use super::types::TerminalSession;

pub struct SpawnedPty {
    pub handle: SessionHandle,
    pub reader: Box<dyn Read + Send>,
    /// Clone of the session's output broadcast sender. The caller's reader loop
    /// publishes raw PTY chunks here so remote mirror clients can attach.
    pub output_tx: tokio::sync::broadcast::Sender<Vec<u8>>,
    /// Clone of the session's scrollback ring. The caller's reader loop appends
    /// raw PTY chunks here (while history capture is on) so a remote mirror can
    /// replay history on attach.
    pub history: Arc<Mutex<OutputHistory>>,
}

pub fn spawn_pty(
    id: String,
    shell: String,
    args: Vec<String>,
    cwd: Option<String>,
    cols: u16,
    rows: u16,
    extra_env: Option<HashMap<String, String>>,
) -> Result<SpawnedPty, String> {
    let pty_system = native_pty_system();
    let pair = pty_system
        .openpty(PtySize {
            cols,
            rows,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("openpty failed: {e}"))?;

    let mut cmd = CommandBuilder::new(&shell);
    for a in &args {
        cmd.arg(a);
    }
    if let Some(cwd_str) = cwd.as_deref() {
        let p = PathBuf::from(cwd_str);
        if p.is_dir() {
            cmd.cwd(p);
        }
    }
    cmd.env("TERM", "xterm-256color");
    cmd.env("COLORTERM", "truecolor");
    if let Some(env) = extra_env {
        for (k, v) in env {
            cmd.env(k, v);
        }
    }

    let child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("spawn failed: {e}"))?;

    let reader = pair
        .master
        .try_clone_reader()
        .map_err(|e| format!("clone reader failed: {e}"))?;
    let writer = pair
        .master
        .take_writer()
        .map_err(|e| format!("take writer failed: {e}"))?;

    let output_tx = SessionHandle::new_output_channel();
    let history = Arc::new(Mutex::new(OutputHistory::default()));

    let handle = SessionHandle {
        meta: TerminalSession {
            id: id.clone(),
            shell: shell.clone(),
            cwd: cwd.clone(),
        },
        master: pair.master,
        writer,
        child,
        output_tx: output_tx.clone(),
        history: history.clone(),
    };
    Ok(SpawnedPty {
        handle,
        reader,
        output_tx,
        history,
    })
}
