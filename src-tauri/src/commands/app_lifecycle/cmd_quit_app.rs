use tauri::AppHandle;

/// Fully exits the application process.
///
/// `getCurrentWindow().close()` on macOS only closes the window — the app
/// process stays alive (dock icon remains). This command terminates the
/// entire process so Cmd+Q truly quits Genisys.
#[tauri::command]
pub fn cmd_quit_app(app_handle: AppHandle) {
    app_handle.exit(0);
}
