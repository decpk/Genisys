//! Custom macOS application menu.
//!
//! Tauri v2 installs a default native menu on macOS whose **Window → Close**
//! item is bound to **Cmd+W**. macOS dispatches that key equivalent at the
//! AppKit level *before* it ever reaches the webview, so the in-app
//! keyboard-shortcut dispatcher never sees Cmd+W — and `terminal.closeTab`
//! (plus the other per-app `Mod+W` "close tab" shortcuts) can never fire.
//! Instead Cmd+W triggers the window close-requested / quit-confirm flow.
//!
//! To free Cmd+W for the frontend we install our own menu that mirrors the
//! standard macOS menus but deliberately OMITS the Cmd+W "Close Window" item.
//! The window can still be closed with the red traffic-light button, which
//! keeps routing through the existing close-requested handler.

#[cfg(target_os = "macos")]
use tauri::{
    menu::{AboutMetadata, Menu, MenuBuilder, SubmenuBuilder},
    AppHandle, Runtime,
};

/// Build the macOS application menu with no Cmd+W "Close Window" accelerator.
#[cfg(target_os = "macos")]
pub fn build_macos_menu<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    let info = app.package_info();
    let about = AboutMetadata {
        name: Some(info.name.clone()),
        version: Some(info.version.to_string()),
        ..Default::default()
    };

    let app_menu = SubmenuBuilder::new(app, info.name.clone())
        .about(Some(about))
        .separator()
        .services()
        .separator()
        .hide()
        .hide_others()
        .show_all()
        .separator()
        .quit()
        .build()?;

    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()?;

    let view_menu = SubmenuBuilder::new(app, "View").fullscreen().build()?;

    // Deliberately no `.close_window()` here — omitting it frees Cmd+W so the
    // frontend keyboard-shortcut dispatcher receives it.
    let window_menu = SubmenuBuilder::new(app, "Window").minimize().build()?;

    MenuBuilder::new(app)
        .items(&[&app_menu, &edit_menu, &view_menu, &window_menu])
        .build()
}
