use regex::Regex;
use std::sync::OnceLock;

/// Detects hex / rgb / hsl colors. Faithful port of the frontend
/// `detectColor` smart-collection detector.
pub fn detect_color(text: &str) -> bool {
    let trimmed = text.trim();

    static HEX: OnceLock<Regex> = OnceLock::new();
    static RGB: OnceLock<Regex> = OnceLock::new();
    static HSL: OnceLock<Regex> = OnceLock::new();
    static HEX_INLINE: OnceLock<Regex> = OnceLock::new();

    let hex = HEX.get_or_init(|| {
        Regex::new(r"(?i)^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$").expect("valid hex regex")
    });
    let rgb = RGB.get_or_init(|| {
        Regex::new(r"(?i)rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\)")
            .expect("valid rgb regex")
    });
    let hsl = HSL.get_or_init(|| {
        Regex::new(r"(?i)hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*[\d.]+\s*)?\)")
            .expect("valid hsl regex")
    });
    let hex_inline = HEX_INLINE.get_or_init(|| {
        Regex::new(r"(?i)#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\b").expect("valid hex-inline regex")
    });

    if hex.is_match(trimmed) {
        return true;
    }
    if rgb.is_match(trimmed) {
        return true;
    }
    if hsl.is_match(trimmed) {
        return true;
    }
    if trimmed.chars().count() < 100 && hex_inline.is_match(trimmed) {
        return true;
    }
    false
}
