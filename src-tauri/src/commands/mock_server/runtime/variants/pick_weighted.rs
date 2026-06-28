use super::variant_data::VariantData;

/// Pick a variant using weighted random selection. Weights below 1 are treated
/// as 1. Entropy is sourced from a fresh UUID v4 (no `rand` dependency).
pub(crate) fn pick_weighted(variants: &[VariantData]) -> Option<&VariantData> {
    if variants.is_empty() {
        return None;
    }

    let total: u128 = variants
        .iter()
        .map(|v| v.weight.max(1) as u128)
        .sum();
    if total == 0 {
        return variants.first();
    }

    let entropy = uuid::Uuid::new_v4().as_u128();
    let mut target = entropy % total;

    for v in variants {
        let w = v.weight.max(1) as u128;
        if target < w {
            return Some(v);
        }
        target -= w;
    }

    variants.last()
}
