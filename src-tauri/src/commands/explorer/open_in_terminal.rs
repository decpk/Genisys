use serde_json::Value;
use std::path::PathBuf;
use std::process::Command;

#[tauri::command]
pub async fn cmd_open_in_terminal(path: String) -> Value {
    let target = PathBuf::from(&path);
    let dir = if target.is_file() {
        match target.parent() {
            Some(p) => p.to_path_buf(),
            None => return crate::commands::err_val("Cannot determine parent directory"),
        }
    } else if target.is_dir() {
        target
    } else {
        return crate::commands::err_val(format!("Path does not exist: {path}"));
    };

    let dir_str = dir.to_string_lossy().to_string();

    #[cfg(target_os = "macos")]
    let result = Command::new("open").args(["-a", "Terminal", &dir_str]).spawn();

    #[cfg(target_os = "windows")]
    let result = Command::new("cmd")
        .args(["/C", "start", "", "cmd", "/K", &format!("cd /d {dir_str}")])
        .spawn();

    #[cfg(target_os = "linux")]
    let result = {
        let terminals = [
            "x-terminal-emulator",
            "gnome-terminal",
            "konsole",
            "xfce4-terminal",
            "xterm",
        ];
        let mut last_err = String::from("No terminal emulator found");
        let mut ok = false;
        for term in &terminals {
            match Command::new(term)
                .arg(if *term == "gnome-terminal" || *term == "konsole" {
                    "--working-directory"
                } else {
                    "-e"
                })
                .arg(if *term == "gnome-terminal" || *term == "konsole" {
                    &dir_str
                } else {
                    "sh"
                })
                .current_dir(&dir)
                .spawn()
            {
                Ok(_) => {
                    ok = true;
                    break;
                }
                Err(e) => {
                    last_err = e.to_string();
                }
            }
        }
        if ok {
            Ok(std::process::Child::from(std::process::Command::new("true").spawn().unwrap()))
        } else {
            Err(std::io::Error::new(std::io::ErrorKind::NotFound, last_err))
        }
    };

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    let result: Result<std::process::Child, std::io::Error> = Err(std::io::Error::new(
        std::io::ErrorKind::Unsupported,
        "Unsupported platform",
    ));

    match result {
        Ok(_) => serde_json::json!({"success": true}),
        Err(e) => crate::commands::err_val(format!("Failed to open terminal: {e}")),
    }
}
