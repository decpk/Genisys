/// Generate a random full name by combining a first and last name from static
/// lists. Uses UUID v4 entropy (no extra crates) to pick the indices.
pub(crate) fn faker_name() -> String {
    const FIRST: [&str; 10] = [
        "Alice", "Bob", "Carol", "Dave", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy",
    ];
    const LAST: [&str; 10] = [
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
        "Rodriguez", "Martinez",
    ];

    let r = uuid::Uuid::new_v4().as_u128();
    let first = FIRST[(r % FIRST.len() as u128) as usize];
    let last = LAST[((r >> 64) % LAST.len() as u128) as usize];

    format!("{} {}", first, last)
}
