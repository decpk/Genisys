use serde::Serialize;

/// Payload emitted on the `explorer-copy-progress` Tauri event.
///
/// Serializes to camelCase to match the frontend `ExplorerCopyProgress` type
/// (`operationId`, `totalBytes`, `copiedBytes`, `totalFiles`, `filesDone`,
/// `currentFile`, `done`).
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CopyProgressPayload {
    pub operation_id: String,
    pub total_bytes: u64,
    pub copied_bytes: u64,
    pub total_files: u64,
    pub files_done: u64,
    pub current_file: String,
    pub done: bool,
}
