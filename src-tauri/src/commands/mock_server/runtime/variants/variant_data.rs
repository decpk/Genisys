/// A single response variant loaded into the running server. Cloned per request
/// into the route handler closure.
#[derive(Clone)]
pub(crate) struct VariantData {
    pub(crate) id: String,
    #[allow(dead_code)]
    pub(crate) name: String,
    pub(crate) status_code: u16,
    pub(crate) response_headers: String,
    pub(crate) response_body: String,
    pub(crate) match_rules: String,
    pub(crate) weight: i64,
    #[allow(dead_code)]
    pub(crate) order_index: i64,
}
