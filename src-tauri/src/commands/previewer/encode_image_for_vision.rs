/// Decode arbitrary image bytes and re-encode them as a flattened RGB JPEG that
/// the vision endpoint accepts. Alpha is composited over a white
/// background and the image is downscaled so neither dimension exceeds 2048px
/// (matching the limit the model uses internally). Returns `(jpeg_bytes, mime)`.
///
/// Replicated verbatim from the clipboard vision pipeline so the previewer
/// module stays self-contained (the clipboard helper is private to its module).
pub fn encode_image_for_vision(bytes: &[u8]) -> Result<(Vec<u8>, &'static str), String> {
    use image::{imageops::FilterType, GenericImageView};

    let img = image::load_from_memory(bytes).map_err(|e| format!("decode failed: {e}"))?;

    // Downscale to a 2048px bound to keep the payload within model limits.
    const MAX_DIM: u32 = 2048;
    let (w, h) = img.dimensions();
    let img = if w > MAX_DIM || h > MAX_DIM {
        img.resize(MAX_DIM, MAX_DIM, FilterType::Triangle)
    } else {
        img
    };

    // Flatten any alpha over a white background, then drop the alpha channel.
    let rgba = img.to_rgba8();
    let (w, h) = rgba.dimensions();
    let mut rgb = image::RgbImage::new(w, h);
    for (x, y, px) in rgba.enumerate_pixels() {
        let [r, g, b, a] = px.0;
        let a = a as f32 / 255.0;
        let blend = |c: u8| -> u8 { (c as f32 * a + 255.0 * (1.0 - a)).round() as u8 };
        rgb.put_pixel(x, y, image::Rgb([blend(r), blend(g), blend(b)]));
    }

    let mut out = std::io::Cursor::new(Vec::new());
    image::codecs::jpeg::JpegEncoder::new_with_quality(&mut out, 85)
        .encode_image(&image::DynamicImage::ImageRgb8(rgb))
        .map_err(|e| format!("encode failed: {e}"))?;
    Ok((out.into_inner(), "image/jpeg"))
}
