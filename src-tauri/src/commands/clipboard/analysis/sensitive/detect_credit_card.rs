use super::super::utf16_offset::byte_to_utf16_offset;
use crate::types::SensitivityMatch;
use regex::Regex;
use std::sync::OnceLock;

/// Validates a digit string with the Luhn checksum (port of the TS `luhnCheck`).
fn luhn_check(digits: &str) -> bool {
    let mut sum = 0u32;
    let mut alternate = false;
    for ch in digits.chars().rev() {
        let mut n = match ch.to_digit(10) {
            Some(d) => d,
            None => continue,
        };
        if alternate {
            n *= 2;
            if n > 9 {
                n -= 9;
            }
        }
        sum += n;
        alternate = !alternate;
    }
    sum % 10 == 0
}

/// Detects Luhn-valid credit-card numbers. Faithful port of the frontend
/// `detectCreditCard` sensitive-data detector. Matches are `critical`.
pub fn detect_credit_card(text: &str) -> Vec<SensitivityMatch> {
    static RE: OnceLock<Regex> = OnceLock::new();
    let re = RE.get_or_init(|| {
        Regex::new(r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b")
            .expect("valid credit-card regex")
    });

    let mut matches = Vec::new();
    for m in re.find_iter(text) {
        let digits: String = m.as_str().chars().filter(|c| c.is_ascii_digit()).collect();
        if luhn_check(&digits) {
            matches.push(SensitivityMatch {
                kind: "credit_card".to_string(),
                label: "Credit Card".to_string(),
                level: "critical".to_string(),
                start: byte_to_utf16_offset(text, m.start()),
                end: byte_to_utf16_offset(text, m.end()),
            });
        }
    }
    matches
}
