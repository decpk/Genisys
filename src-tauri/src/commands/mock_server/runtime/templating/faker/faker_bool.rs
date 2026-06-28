/// Generate a random boolean as the string `"true"` or `"false"`. Uses UUID v4
/// entropy (no extra crates).
pub(crate) fn faker_bool() -> String {
    let r = uuid::Uuid::new_v4().as_u128();
    if r & 1 == 0 {
        "true".to_string()
    } else {
        "false".to_string()
    }
}
