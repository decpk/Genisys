/// Generate a random UUID v4 string.
pub(crate) fn faker_uuid() -> String {
    uuid::Uuid::new_v4().to_string()
}
