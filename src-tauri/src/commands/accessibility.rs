//! Native macOS Accessibility (AX) permission helpers for the "Stay Awake"
//! presence nudge.
//!
//! The keep-awake feature taps a no-op key via `enigo`, which on macOS requires
//! the app to be trusted under System Settings → Privacy & Security →
//! Accessibility. Unlike camera/microphone (handled in `av_permissions`), there
//! is no AVFoundation-style async request — the OS exposes `AXIsProcessTrusted`
//! (a live, *uncached* check) and `AXIsProcessTrustedWithOptions` (which also
//! surfaces the system prompt that registers the app in the list).
//!
//! On non-macOS targets every command reports "trusted" so the keep-awake code
//! path keeps its existing behaviour unchanged.

/// Returns `true` when Genisys is currently trusted for Accessibility / input
/// simulation.
///
/// This reads the live OS state on **every** call (no caching), so once the
/// user grants the permission a subsequent call reflects it without an app
/// restart — which is exactly what the focus-driven re-check relies on.
#[tauri::command]
pub fn cmd_accessibility_status() -> bool {
    #[cfg(target_os = "macos")]
    {
        macos_ax::is_trusted()
    }
    #[cfg(not(target_os = "macos"))]
    {
        true
    }
}

/// Triggers the native Accessibility prompt (the first time) and returns the
/// current trust state.
///
/// The prompt adds Genisys to the Accessibility list and directs the user to
/// System Settings; it never blocks and returns immediately with the
/// (still likely `false`) current trust value.
#[tauri::command]
pub fn cmd_request_accessibility() -> bool {
    #[cfg(target_os = "macos")]
    {
        macos_ax::prompt_trust()
    }
    #[cfg(not(target_os = "macos"))]
    {
        true
    }
}

/// Opens the macOS Accessibility privacy pane so the user can toggle Genisys.
/// No-op on non-macOS targets.
#[tauri::command]
pub fn cmd_open_accessibility_settings() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        open::that("x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")
            .map_err(|e| e.to_string())
    }
    #[cfg(not(target_os = "macos"))]
    {
        Ok(())
    }
}

#[cfg(target_os = "macos")]
mod macos_ax {
    use core_foundation::base::TCFType;
    use core_foundation::boolean::CFBoolean;
    use core_foundation::dictionary::{CFDictionary, CFDictionaryRef};
    use core_foundation::string::{CFString, CFStringRef};

    /// Carbon `Boolean` is an `unsigned char`; only `0` means false. Comparing
    /// against `0` avoids the undefined behaviour of transmuting an arbitrary
    /// byte into a Rust `bool`.
    type Boolean = u8;

    // Linked via `cargo:rustc-link-lib=framework=ApplicationServices` in build.rs.
    extern "C" {
        fn AXIsProcessTrusted() -> Boolean;
        fn AXIsProcessTrustedWithOptions(options: CFDictionaryRef) -> Boolean;
        /// `CFStringRef` key controlling whether the trust check also prompts.
        static kAXTrustedCheckOptionPrompt: CFStringRef;
    }

    /// Live, uncached Accessibility trust check.
    pub fn is_trusted() -> bool {
        unsafe { AXIsProcessTrusted() != 0 }
    }

    /// Trust check that also presents the native prompt the first time the app
    /// asks (registering Genisys in the Accessibility list).
    pub fn prompt_trust() -> bool {
        unsafe {
            let key = CFString::wrap_under_get_rule(kAXTrustedCheckOptionPrompt);
            let value = CFBoolean::true_value();
            let options =
                CFDictionary::from_CFType_pairs(&[(key.as_CFType(), value.as_CFType())]);
            AXIsProcessTrustedWithOptions(options.as_concrete_TypeRef()) != 0
        }
    }
}
