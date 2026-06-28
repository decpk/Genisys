use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

/// Registers a system-wide keyboard shortcut (Cmd+Option+Control+C on Mac,
/// Ctrl+Alt+Win+C on Windows/Linux) that brings the main window to focus
/// and emits a `navigate-to-clipboard` event to the frontend.
pub fn register_clipboard_shortcut(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let shortcut = Shortcut::new(
        Some(Modifiers::SUPER | Modifiers::ALT | Modifiers::CONTROL),
        Code::KeyC,
    );

    app.global_shortcut()
        .on_shortcut(shortcut, |app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.unminimize();
                    let _ = window.show();
                    let _ = window.set_focus();
                    let _ = window.emit("navigate-to-clipboard", ());
                }
            }
        })?;

    Ok(())
}
