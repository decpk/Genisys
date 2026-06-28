use super::{KeepAwakeInner, KeepAwakeState};

/// Returns whether "stay awake even with the lid closed" is currently applied.
#[tauri::command]
pub fn cmd_keep_awake_lid_status(state: tauri::State<'_, KeepAwakeState>) -> Result<bool, String> {
    let inner = state.inner.lock().map_err(|e| e.to_string())?;
    Ok(inner.lid_active)
}

/// Enables or disables lid-close sleep prevention.
///
/// Unlike the IOKit/idle inhibitor (which needs no privileges), blocking sleep
/// while the lid is shut requires OS-level power changes: `pmset disablesleep`
/// (macOS, admin), a power-plan lid-action change (Windows, admin) or a
/// `systemd-inhibit` lock (Linux, no admin). Every mechanism is reverted on
/// disable and on app exit so the machine is never left unable to sleep.
#[tauri::command]
pub fn cmd_keep_awake_lid_set(
    state: tauri::State<'_, KeepAwakeState>,
    enabled: bool,
) -> Result<(), String> {
    let mut inner = state.inner.lock().map_err(|e| e.to_string())?;

    // Idempotent — no work when already in the requested state.
    if enabled == inner.lid_active {
        return Ok(());
    }

    if enabled {
        apply_lid_close(&mut inner)?;
    } else {
        revert_lid_close(&mut inner);
    }
    inner.lid_active = enabled;
    Ok(())
}

/// Best-effort revert of any active lid-close prevention. Invoked on app exit so
/// Genisys never leaves the OS unable to sleep after it closes.
pub fn revert_lid_close_on_exit(state: &KeepAwakeState) {
    if let Ok(mut inner) = state.inner.lock() {
        if inner.lid_active {
            revert_lid_close(&mut inner);
            inner.lid_active = false;
        }
    }
}

// ─── macOS ──────────────────────────────────────────────────────────────────
// `pmset -a disablesleep 1` disables ALL sleep (including clamshell/lid) and
// requires root, so it is run through an AppleScript admin-auth prompt.

#[cfg(target_os = "macos")]
fn apply_lid_close(_inner: &mut KeepAwakeInner) -> Result<(), String> {
    run_pmset_admin(true)
}

#[cfg(target_os = "macos")]
fn revert_lid_close(_inner: &mut KeepAwakeInner) {
    let _ = run_pmset_admin(false);
}

#[cfg(target_os = "macos")]
fn run_pmset_admin(disable_sleep: bool) -> Result<(), String> {
    use std::process::Command;

    let value = if disable_sleep { "1" } else { "0" };
    // The pmset path is fixed and `value` is a constant "0"/"1", so there is no
    // user-controlled input to escape in the AppleScript string.
    let script = format!(
        "do shell script \"/usr/bin/pmset -a disablesleep {value}\" with administrator privileges"
    );

    let output = Command::new("/usr/bin/osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| format!("Failed to launch osascript: {e}"))?;

    if output.status.success() {
        return Ok(());
    }

    let stderr = String::from_utf8_lossy(&output.stderr);
    // osascript returns error -128 when the user cancels the admin prompt.
    if stderr.contains("-128") || stderr.to_lowercase().contains("cancel") {
        Err("Administrator permission was declined, so keeping the Mac awake \
             with the lid closed could not be enabled."
            .to_string())
    } else {
        Err(format!("Could not update sleep settings: {}", stderr.trim()))
    }
}

// ─── Windows ────────────────────────────────────────────────────────────────
// Change the active power plan's lid-close action to "Do nothing" (0) for both
// AC and DC, saving the prior values so they can be restored. Requires admin.

#[cfg(target_os = "windows")]
const SUB_BUTTONS: &str = "4f971e89-eebd-4455-a8de-9e59040e7347";
#[cfg(target_os = "windows")]
const LIDACTION: &str = "5ca83367-6e45-459f-a27b-476b1d01c936";

#[cfg(target_os = "windows")]
fn apply_lid_close(inner: &mut KeepAwakeInner) -> Result<(), String> {
    // Remember the user's current lid-close action so we can restore it exactly.
    let saved = query_lid_action().unwrap_or_else(|| ("1".to_string(), "1".to_string()));
    set_lid_action_elevated("0", "0")?; // 0 = "Do nothing"
    inner.saved_lid_action = Some(saved);
    Ok(())
}

#[cfg(target_os = "windows")]
fn revert_lid_close(inner: &mut KeepAwakeInner) {
    // Fall back to "Sleep" (1) if we somehow never recorded a prior value.
    let (ac, dc) = inner
        .saved_lid_action
        .take()
        .unwrap_or_else(|| ("1".to_string(), "1".to_string()));
    let _ = set_lid_action_elevated(&ac, &dc);
}

#[cfg(target_os = "windows")]
fn query_lid_action() -> Option<(String, String)> {
    use std::process::Command;
    let out = Command::new("powercfg")
        .args(["/query", "SCHEME_CURRENT", SUB_BUTTONS, LIDACTION])
        .output()
        .ok()?;
    let text = String::from_utf8_lossy(&out.stdout);
    // Lines look like: "Current AC Power Setting Index: 0x00000001".
    let mut indices = text.lines().filter_map(|line| {
        if line.to_lowercase().contains("power setting index") {
            line.rsplit(':').next().map(|v| v.trim().to_string())
        } else {
            None
        }
    });
    let ac = indices.next()?;
    let dc = indices.next().unwrap_or_else(|| ac.clone());
    Some((ac, dc))
}

#[cfg(target_os = "windows")]
fn set_lid_action_elevated(ac: &str, dc: &str) -> Result<(), String> {
    use std::process::Command;
    // Chain all three powercfg calls inside a single elevated `cmd` so the user
    // sees only one UAC prompt. `ac`/`dc` are powercfg index values (0 or a hex
    // string we previously parsed) — no quoting hazards.
    let inner_cmd = format!(
        "powercfg /setacvalueindex SCHEME_CURRENT {SUB_BUTTONS} {LIDACTION} {ac} && \
         powercfg /setdcvalueindex SCHEME_CURRENT {SUB_BUTTONS} {LIDACTION} {dc} && \
         powercfg /setactive SCHEME_CURRENT"
    );
    let ps = format!(
        "Start-Process cmd -Verb RunAs -Wait -WindowStyle Hidden -ArgumentList '/c','{inner_cmd}'"
    );
    let output = Command::new("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", &ps])
        .output()
        .map_err(|e| format!("Failed to launch powercfg: {e}"))?;
    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!(
            "Could not change the lid-close behaviour (admin may have been declined): {}",
            stderr.trim()
        ))
    }
}

// ─── Linux ──────────────────────────────────────────────────────────────────
// Hold a systemd-logind inhibitor lock on the lid switch. No privileges needed;
// releasing (killing) the child process removes the lock.

#[cfg(target_os = "linux")]
fn apply_lid_close(inner: &mut KeepAwakeInner) -> Result<(), String> {
    use std::process::{Command, Stdio};
    let child = Command::new("systemd-inhibit")
        .args([
            "--what=handle-lid-switch",
            "--who=Genisys",
            "--why=Stay Awake (lid closed)",
            "--mode=block",
            "sleep",
            "infinity",
        ])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| {
            format!("Failed to start systemd-inhibit ({e}). A systemd-based session is required.")
        })?;
    inner.lid_inhibitor = Some(child);
    Ok(())
}

#[cfg(target_os = "linux")]
fn revert_lid_close(inner: &mut KeepAwakeInner) {
    if let Some(mut child) = inner.lid_inhibitor.take() {
        let _ = child.kill();
        let _ = child.wait();
    }
}

// ─── Other platforms ────────────────────────────────────────────────────────

#[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
fn apply_lid_close(_inner: &mut KeepAwakeInner) -> Result<(), String> {
    Err("Preventing sleep with the lid closed is not supported on this platform.".to_string())
}

#[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
fn revert_lid_close(_inner: &mut KeepAwakeInner) {}
