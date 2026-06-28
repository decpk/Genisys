/// Plain data carrier for HTML-derived link-preview metadata.
///
/// The command layer assembles these fields into the camelCase JSON envelope
/// with `serde_json::json!`, so no `serde` derives live here.
pub struct LinkMetadata {
    pub title: String,
    pub description: String,
    pub site_name: String,
    pub favicon_url: String,
    pub image_url: String,
    pub theme_color: String,
}
