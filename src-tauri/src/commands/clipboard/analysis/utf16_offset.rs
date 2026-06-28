/// Converts a UTF-8 byte offset into a UTF-16 code-unit offset.
///
/// The frontend masks sensitive text using `String.prototype.slice`, whose
/// indices are UTF-16 code units. The Rust `regex` crate reports byte offsets,
/// so match positions are converted here to keep masking aligned with JS.
pub fn byte_to_utf16_offset(text: &str, byte_idx: usize) -> i64 {
    let clamped = byte_idx.min(text.len());

    // Walk back to the nearest char boundary at or before the byte index so the
    // prefix slice is always valid UTF-8.
    let mut boundary = clamped;
    while boundary > 0 && !text.is_char_boundary(boundary) {
        boundary -= 1;
    }

    text[..boundary].encode_utf16().count() as i64
}
