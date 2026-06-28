use super::types::DefaultShell;

/// Resolves the OS-default interactive shell.
pub fn resolve_default_shell() -> DefaultShell {
    #[cfg(target_os = "windows")]
    {
        return DefaultShell {
            shell: std::env::var("COMSPEC").unwrap_or_else(|_| "powershell.exe".to_string()),
            args: Vec::new(),
        };
    }

    #[cfg(not(target_os = "windows"))]
    {
        let shell = std::env::var("SHELL").unwrap_or_else(|_| {
            if std::path::Path::new("/bin/zsh").exists() {
                "/bin/zsh".to_string()
            } else {
                "/bin/bash".to_string()
            }
        });
        DefaultShell {
            shell,
            args: vec!["-l".to_string()],
        }
    }
}
