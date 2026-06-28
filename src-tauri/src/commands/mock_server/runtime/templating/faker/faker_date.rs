/// Generate a recent ISO date string (`YYYY-MM-DD`) within the last year. Uses
/// UUID v4 entropy (no extra crates) to choose how many days back from today.
pub(crate) fn faker_date() -> String {
    let r = uuid::Uuid::new_v4().as_u128();
    let days_back = (r % 365) as i64;
    let date = chrono::Utc::now() - chrono::Duration::days(days_back);
    date.format("%Y-%m-%d").to_string()
}
