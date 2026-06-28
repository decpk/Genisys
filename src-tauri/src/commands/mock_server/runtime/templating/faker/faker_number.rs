/// Generate a random integer as a string.
///
/// `args` is the optional contents of `faker.number(...)`. When it parses as
/// `min,max` that inclusive range is used; otherwise a default range of
/// `0..=1000` applies. Uses UUID v4 entropy (no extra crates).
pub(crate) fn faker_number(args: Option<&str>) -> String {
    let (min, max) = parse_range(args);
    if max <= min {
        return min.to_string();
    }

    let span = (max - min + 1) as u128;
    let r = uuid::Uuid::new_v4().as_u128();
    let n = min + (r % span) as i64;

    n.to_string()
}

/// Parse a `min,max` argument string into an inclusive integer range, falling
/// back to `(0, 1000)` when absent or malformed.
fn parse_range(args: Option<&str>) -> (i64, i64) {
    if let Some(a) = args {
        let parts: Vec<&str> = a.split(',').map(|s| s.trim()).collect();
        if parts.len() == 2 {
            if let (Ok(min), Ok(max)) = (parts[0].parse::<i64>(), parts[1].parse::<i64>()) {
                return (min, max);
            }
        }
    }
    (0, 1000)
}
