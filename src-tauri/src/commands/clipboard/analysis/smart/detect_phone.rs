use regex::Regex;
use std::sync::OnceLock;

/// Detects phone numbers. Faithful port of the frontend `detectPhoneNumber`
/// smart-collection detector.
pub fn detect_phone(text: &str) -> bool {
    let trimmed = text.trim();
    let char_len = trimmed.chars().count();
    if char_len > 30 {
        return false;
    }

    static PHONE: OnceLock<Regex> = OnceLock::new();
    static PURE_DIGITS: OnceLock<Regex> = OnceLock::new();

    let pure_digits =
        PURE_DIGITS.get_or_init(|| Regex::new(r"^\d+$").expect("valid pure-digits regex"));
    if pure_digits.is_match(trimmed) && char_len < 7 {
        return false;
    }

    let phone = PHONE.get_or_init(|| {
        Regex::new(r"(\+?\d{1,4}[\s.\-]?)?(\(?\d{2,4}\)?[\s.\-]?)?\d{3,4}[\s.\-]?\d{4}")
            .expect("valid phone regex")
    });
    phone.is_match(trimmed)
}
