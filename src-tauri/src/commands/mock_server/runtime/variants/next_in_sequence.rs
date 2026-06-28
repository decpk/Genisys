use std::sync::atomic::{AtomicU64, Ordering};

use super::variant_data::VariantData;

/// Pick the next variant in round-robin order using a shared atomic counter.
/// The counter is monotonically incremented per request and wrapped modulo the
/// number of variants.
pub(crate) fn next_in_sequence<'a>(
    variants: &'a [VariantData],
    counter: &AtomicU64,
) -> Option<&'a VariantData> {
    if variants.is_empty() {
        return None;
    }
    let n = counter.fetch_add(1, Ordering::Relaxed);
    let idx = (n as usize) % variants.len();
    variants.get(idx)
}
