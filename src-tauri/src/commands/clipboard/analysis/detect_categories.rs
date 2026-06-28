use super::smart::{
    detect_code, detect_color, detect_email, detect_filepath, detect_json, detect_phone,
    detect_shell, detect_url,
};

/// Returns the smart-collection category keys a text item belongs to. Faithful
/// port of the frontend `detectCategories` orchestrator (detector order is
/// preserved: url, code, color, email, json, shell, filepath, phone).
pub fn detect_categories(text: &str) -> Vec<String> {
    if text.trim().is_empty() {
        return Vec::new();
    }

    let mut categories = Vec::new();
    if detect_url(text) {
        categories.push("url".to_string());
    }
    if detect_code(text) {
        categories.push("code".to_string());
    }
    if detect_color(text) {
        categories.push("color".to_string());
    }
    if detect_email(text) {
        categories.push("email".to_string());
    }
    if detect_json(text) {
        categories.push("json".to_string());
    }
    if detect_shell(text) {
        categories.push("shell".to_string());
    }
    if detect_filepath(text) {
        categories.push("filepath".to_string());
    }
    if detect_phone(text) {
        categories.push("phone".to_string());
    }
    categories
}
