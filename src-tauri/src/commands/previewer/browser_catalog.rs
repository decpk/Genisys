/// A known browser and how to detect / launch it on macOS.
pub struct BrowserCatalogEntry {
    /// Stable id (e.g. "chrome").
    pub id: &'static str,
    /// Display name shown in the menu (e.g. "Google Chrome").
    pub name: &'static str,
    /// macOS `.app` bundle name (without extension). Used both to detect the
    /// app under /Applications and as the `open -a <app_name>` argument.
    pub app_name: &'static str,
}

/// Static catalog of browsers Genisys knows how to open URLs in, roughly ordered
/// by popularity so the menu reads naturally.
pub fn browser_catalog() -> &'static [BrowserCatalogEntry] {
    &[
        BrowserCatalogEntry { id: "safari", name: "Safari", app_name: "Safari" },
        BrowserCatalogEntry { id: "chrome", name: "Google Chrome", app_name: "Google Chrome" },
        BrowserCatalogEntry { id: "firefox", name: "Firefox", app_name: "Firefox" },
        BrowserCatalogEntry { id: "brave", name: "Brave", app_name: "Brave Browser" },
        BrowserCatalogEntry { id: "arc", name: "Arc", app_name: "Arc" },
        BrowserCatalogEntry { id: "opera", name: "Opera", app_name: "Opera" },
        BrowserCatalogEntry { id: "vivaldi", name: "Vivaldi", app_name: "Vivaldi" },
        BrowserCatalogEntry { id: "chromium", name: "Chromium", app_name: "Chromium" },
    ]
}
