use rusqlite::params;

use super::Database;

/// Delete a variant by id. Returns an error string on failure.
pub fn mock_delete_variant_db(db: &Database, id: &str) -> Result<(), String> {
    let conn = db.conn();
    conn.execute(
        "DELETE FROM mock_endpoint_variants WHERE id = ?1",
        params![id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
