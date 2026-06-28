//! Native macOS camera/microphone permission pre-flight.
//!
//! WKWebView (via wry) already grants the *web-layer* `getUserMedia` permission,
//! but on a packaged `.app` the system only registers Genisys under
//! System Settings → Privacy & Security → Microphone/Camera once an
//! **AVFoundation capture request reaches TCC**. These commands drive that
//! request from the app's own process identity so the OS prompt fires
//! deterministically and Genisys shows up (and stays toggleable) in System Settings.
//!
//! On non-macOS targets the commands are inert: status reports `"authorized"`
//! and the access request resolves `true`, so the web `getUserMedia` path keeps
//! its existing behaviour unchanged.

/// Returns the current authorization status for a capture media type.
///
/// `media` is `"audio"` or `"video"`. The result is one of
/// `"notDetermined" | "restricted" | "denied" | "authorized" | "unknown"`,
/// mirroring `AVAuthorizationStatus`.
#[tauri::command]
pub fn cmd_av_authorization_status(media: String) -> String {
    #[cfg(target_os = "macos")]
    {
        macos_av::authorization_status(&media)
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = media;
        "authorized".to_string()
    }
}

/// Requests access to a capture media type, triggering the native TCC prompt the
/// first time. Resolves `true` if access is (or becomes) authorized.
///
/// `media` is `"audio"` or `"video"`. Awaiting this before `getUserMedia`
/// guarantees the OS prompt is presented under the Genisys identity, which is what
/// registers the app in System Settings.
#[tauri::command]
pub async fn cmd_request_av_access(media: String) -> bool {
    #[cfg(target_os = "macos")]
    {
        let (tx, rx) = tokio::sync::oneshot::channel::<bool>();
        macos_av::request_access(&media, move |granted| {
            let _ = tx.send(granted);
        });
        rx.await.unwrap_or(false)
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = media;
        true
    }
}

/// Opens the relevant macOS privacy pane so the user can toggle the permission.
///
/// `pane` is `"camera"` or `"microphone"` (anything else falls back to the
/// microphone pane). No-op on non-macOS targets.
#[tauri::command]
pub fn cmd_open_privacy_settings(pane: String) -> Result<(), String> {
    let url = match pane.as_str() {
        "camera" => "x-apple.systempreferences:com.apple.preference.security?Privacy_Camera",
        _ => "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone",
    };
    #[cfg(target_os = "macos")]
    {
        open::that(url).map_err(|e| e.to_string())
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = url;
        Ok(())
    }
}

#[cfg(target_os = "macos")]
mod macos_av {
    use std::sync::Mutex;

    use block2::RcBlock;
    use objc2::msg_send;
    use objc2::rc::Retained;
    use objc2::runtime::{AnyClass, Bool};
    use objc2_foundation::NSString;

    /// Builds the `AVMediaType` NSString for a capture kind.
    ///
    /// `AVMediaTypeVideo == @"vide"` and `AVMediaTypeAudio == @"soun"`.
    /// `+[AVCaptureDevice authorizationStatusForMediaType:]` compares the value by
    /// string content, so constructing the NSString here avoids having to import
    /// the AVFoundation `extern` constant symbols.
    fn media_type_string(media: &str) -> Retained<NSString> {
        let raw = if media == "video" { "vide" } else { "soun" };
        NSString::from_str(raw)
    }

    /// `AVCaptureDevice` class, looked up at runtime. `None` only if AVFoundation
    /// failed to load (e.g. an unexpected platform), in which case callers degrade
    /// gracefully rather than crash.
    fn capture_device_class() -> Option<&'static AnyClass> {
        AnyClass::get(c"AVCaptureDevice")
    }

    pub fn authorization_status(media: &str) -> String {
        let Some(cls) = capture_device_class() else {
            return "unknown".to_string();
        };
        let media_type = media_type_string(media);
        // AVAuthorizationStatus: 0 notDetermined, 1 restricted, 2 denied, 3 authorized.
        let status: isize =
            unsafe { msg_send![cls, authorizationStatusForMediaType: &*media_type] };
        match status {
            0 => "notDetermined",
            1 => "restricted",
            2 => "denied",
            3 => "authorized",
            _ => "unknown",
        }
        .to_string()
    }

    pub fn request_access<F>(media: &str, callback: F)
    where
        F: FnOnce(bool) + Send + 'static,
    {
        let Some(cls) = capture_device_class() else {
            callback(false);
            return;
        };
        let media_type = media_type_string(media);

        // AVFoundation invokes the completion handler once, on an arbitrary
        // internal queue. Guard the `FnOnce` behind a `Send + Sync` slot so the
        // block is sound to call from that thread.
        let slot: Mutex<Option<F>> = Mutex::new(Some(callback));
        let handler = RcBlock::new(move |granted: Bool| {
            if let Some(cb) = slot.lock().unwrap().take() {
                cb(granted.as_bool());
            }
        });

        // AVFoundation copies (retains) the block; our `RcBlock` is dropped on this
        // thread after the call returns, while AVFoundation keeps its own copy
        // alive until it fires the handler.
        let _: () = unsafe {
            msg_send![
                cls,
                requestAccessForMediaType: &*media_type,
                completionHandler: &*handler,
            ]
        };
    }
}
