fn main() {
  // Link AVFoundation on macOS so the AVCaptureDevice Objective-C class is
  // registered at launch, enabling the native camera/microphone permission
  // pre-flight in `commands::av_permissions`.
  if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("macos") {
    println!("cargo:rustc-link-lib=framework=AVFoundation");
    // ApplicationServices exports the Accessibility (AX) trust APIs
    // (`AXIsProcessTrusted`/`AXIsProcessTrustedWithOptions`) used by
    // `commands::accessibility` to gate the Stay Awake presence nudge.
    println!("cargo:rustc-link-lib=framework=ApplicationServices");
  }
  tauri_build::build()
}
