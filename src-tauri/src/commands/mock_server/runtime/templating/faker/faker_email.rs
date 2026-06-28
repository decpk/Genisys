use super::faker_name::faker_name;

/// Generate a random email address derived from a fake name, e.g.
/// `alice.smith@example.com`.
pub(crate) fn faker_email() -> String {
    let local = faker_name().to_lowercase().replace(' ', ".");
    format!("{}@example.com", local)
}
