use serde_json::Value;
use std::process::Command;

/// Open one or more URLs. On macOS, when `browser` (an `open -a` application
/// name such as "Google Chrome") is provided, all URLs open in that browser in
/// a single invocation; otherwise they open in the system default browser. On
/// other platforms URLs open in the default browser.
#[tauri::command]
pub async fn cmd_open_urls_in_browser(urls: Vec<String>, browser: Option<String>) -> Value {
    if urls.is_empty() {
        return serde_json::json!({ "success": true, "opened": 0 });
    }

    #[cfg(target_os = "macos")]
    let result = {
        let mut cmd = Command::new("open");
        if let Some(app) = browser.as_deref().filter(|s| !s.is_empty()) {
            cmd.arg("-a").arg(app);
        }
        for url in &urls {
            cmd.arg(url);
        }
        cmd.spawn().map(|_| ())
    };

    #[cfg(target_os = "windows")]
    let result = {
        let _ = &browser;
        let mut last: std::io::Result<()> = Ok(());
        for url in &urls {
            last = Command::new("cmd").args(["/C", "start", "", url]).spawn().map(|_| ());
            if last.is_err() {
                break;
            }
        }
        last
    };

    #[cfg(target_os = "linux")]
    let result = {
        let _ = &browser;
        let mut last: std::io::Result<()> = Ok(());
        for url in &urls {
            last = Command::new("xdg-open").arg(url).spawn().map(|_| ());
            if last.is_err() {
                break;
            }
        }
        last
    };

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    let result: std::io::Result<()> = {
        let _ = &browser;
        Err(std::io::Error::new(std::io::ErrorKind::Unsupported, "Unsupported platform"))
    };

    match result {
        Ok(_) => serde_json::json!({ "success": true, "opened": urls.len() }),
        Err(e) => crate::commands::err_val(format!("Failed to open URLs: {e}")),
    }
}
