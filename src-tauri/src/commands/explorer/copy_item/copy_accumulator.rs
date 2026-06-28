use std::time::Instant;

/// Mutable running state shared across the recursive copy walk.
///
/// Tracks how much of the copy operation has completed so that throttled
/// progress events can be emitted to the frontend.
pub struct CopyAccumulator {
    pub operation_id: String,
    pub total_bytes: u64,
    pub copied_bytes: u64,
    pub total_files: u64,
    pub files_done: u64,
    pub last_emit: Instant,
}
