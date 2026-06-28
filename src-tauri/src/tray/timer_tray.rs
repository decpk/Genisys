use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Emitter, Manager, Runtime,
};

const TIMER_TRAY_ID: &str = "genisys-timer-tray";

/// Initialise the Timer menubar tray icon.
///
/// Adds a separate tray icon (id: `genisys-timer-tray`) with a small menu and
/// a dynamic title that the frontend updates via `set_timer_tray_title`.
pub fn init_timer_tray<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "tt-show", "Show Genisys", true, None::<&str>)?;
    let open = MenuItem::with_id(app, "tt-open", "Open Timer", true, None::<&str>)?;
    let pause = MenuItem::with_id(app, "tt-pause", "Pause / Resume", true, None::<&str>)?;
    let reset = MenuItem::with_id(app, "tt-reset", "Reset", true, None::<&str>)?;
    let hide = MenuItem::with_id(app, "tt-hide", "Hide tray", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &open, &pause, &reset, &hide])?;

    let mut builder = TrayIconBuilder::with_id(TIMER_TRAY_ID)
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "tt-show" => {
                show_main_window(app);
                let _ = app.emit("timer-tray://open", ());
            }
            "tt-open" => {
                show_main_window(app);
                let _ = app.emit("timer-tray://open", ());
            }
            "tt-pause" => {
                let _ = app.emit("timer-tray://pause-resume", ());
            }
            "tt-reset" => {
                let _ = app.emit("timer-tray://reset", ());
            }
            "tt-hide" => {
                let _ = set_timer_tray_visible(app, false);
            }
            _ => {}
        });

    if let Some(icon) = app.default_window_icon().cloned() {
        builder = builder.icon(icon).icon_as_template(true);
    }

    builder.build(app)?;
    Ok(())
}

fn show_main_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.show();
        let _ = w.unminimize();
        let _ = w.set_focus();
    }
}

pub fn set_timer_tray_title<R: Runtime>(app: &AppHandle<R>, text: String) -> Result<(), String> {
    let tray = app
        .tray_by_id(TIMER_TRAY_ID)
        .ok_or_else(|| "timer tray not found".to_string())?;
    tray.set_title(Some(&text)).map_err(|e| e.to_string())
}

pub fn set_timer_tray_visible<R: Runtime>(
    app: &AppHandle<R>,
    visible: bool,
) -> Result<(), String> {
    let tray = app
        .tray_by_id(TIMER_TRAY_ID)
        .ok_or_else(|| "timer tray not found".to_string())?;
    tray.set_visible(visible).map_err(|e| e.to_string())
}
