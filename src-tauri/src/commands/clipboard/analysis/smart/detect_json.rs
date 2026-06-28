use regex::Regex;
use std::sync::OnceLock;

/// Detects JSON / YAML / TOML / XML structured data. Faithful port of the
/// frontend `detectJson` smart-collection detector.
pub fn detect_json(text: &str) -> bool {
    let trimmed = text.trim();
    if trimmed.chars().count() < 2 {
        return false;
    }

    let starts_as_json = (trimmed.starts_with('{') && trimmed.ends_with('}'))
        || (trimmed.starts_with('[') && trimmed.ends_with(']'));

    if starts_as_json {
        return serde_json::from_str::<serde_json::Value>(trimmed).is_ok();
    }

    static YAML: OnceLock<Regex> = OnceLock::new();
    static TOML: OnceLock<Regex> = OnceLock::new();
    static XML_START: OnceLock<Regex> = OnceLock::new();
    static XML_CLOSE: OnceLock<Regex> = OnceLock::new();

    let yaml = YAML.get_or_init(|| Regex::new(r"^[\w-]+:\s*.+").expect("valid yaml regex"));
    let yaml_multiline = trimmed
        .split('\n')
        .filter(|line| yaml.is_match(line))
        .count();
    if yaml_multiline >= 2 {
        return true;
    }

    let toml = TOML.get_or_init(|| Regex::new(r"(?m)^\[[\w.-]+\]\s*$").expect("valid toml regex"));
    if toml.is_match(trimmed) {
        return true;
    }

    let xml_start =
        XML_START.get_or_init(|| Regex::new(r"^<\?xml|^<\w+[\s>]").expect("valid xml-start regex"));
    let xml_close = XML_CLOSE.get_or_init(|| Regex::new(r"</\w+>").expect("valid xml-close regex"));
    if xml_start.is_match(trimmed) && xml_close.is_match(trimmed) {
        return true;
    }

    false
}
