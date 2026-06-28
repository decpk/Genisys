use std::sync::atomic::AtomicU64;

use super::match_conditions::match_conditions;
use super::next_in_sequence::next_in_sequence;
use super::pick_weighted::pick_weighted;
use super::variant_data::VariantData;
use super::variant_request_ctx::VariantRequestCtx;

/// Select the variant that should serve the current request based on the
/// endpoint's `variant_mode`.
///
/// Returns `None` when the base endpoint response should be used:
/// - mode `"single"` (or unknown): always `None`.
/// - no variants available: `None`.
/// - mode `"conditional"`: `None` if no variant's rules match.
pub(crate) fn select_variant<'a>(
    mode: &str,
    variants: &'a [VariantData],
    counter: &AtomicU64,
    req: &VariantRequestCtx,
) -> Option<&'a VariantData> {
    if variants.is_empty() {
        return None;
    }

    match mode {
        "sequence" => next_in_sequence(variants, counter),
        "random" => pick_weighted(variants),
        "conditional" => variants
            .iter()
            .find(|v| match_conditions(&v.match_rules, req)),
        // "single" and any unknown mode fall back to the base response.
        _ => None,
    }
}
