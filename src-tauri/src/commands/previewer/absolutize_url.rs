use url::Url;

/// Resolve `maybe_relative` against `base`, returning an absolute URL string.
///
/// Pure and reusable: returns the input unchanged when it is already absolute,
/// joins it against `base` when it is relative, and yields an empty string when
/// the input is blank or cannot be resolved.
pub fn absolutize_url(base: &str, maybe_relative: &str) -> String {
    let candidate = maybe_relative.trim();
    if candidate.is_empty() {
        return String::new();
    }

    // Already an absolute URL?
    if let Ok(abs) = Url::parse(candidate) {
        return abs.to_string();
    }

    // Join the relative reference against the base URL.
    match Url::parse(base) {
        Ok(base_url) => base_url
            .join(candidate)
            .map(|u| u.to_string())
            .unwrap_or_default(),
        Err(_) => String::new(),
    }
}
