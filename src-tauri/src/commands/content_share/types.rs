//! Wire + status types for Content Share, plus the on-disk bundle shapes that
//! travel inside the transferred zip. All types are camelCase on the wire so
//! the TypeScript frontend can consume them directly.

use serde::{Deserialize, Serialize};

use crate::commands::library::image_cache::CachedImageRecord;
use crate::types::{
    Book, Bookmark, Chapter, ChapterTranslation, Note, NoteHighlight, NoteLabel, NoteNotebook,
    NoteProject, NoteSection, NoteTopic,
};

/// A peer Genisys device discovered on the LAN via mDNS.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SharePeer {
    pub device_id: String,
    pub device_name: String,
    pub host: String,
    pub port: u16,
}

/// Snapshot of the local Content Share service for the desktop UI.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ContentShareStatus {
    pub running: bool,
    pub device_id: String,
    pub device_name: String,
    pub ip: Option<String>,
    pub port: Option<u16>,
    pub peers: Vec<SharePeer>,
}

/// Human-readable description of what is being offered — shown verbatim in the
/// receiver's approval prompt.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShareManifest {
    /// `"library"` (a book) or `"notes"`.
    pub kind: String,
    /// Headline, e.g. the book title or "Project: Work".
    pub title: String,
    /// One-line summary, e.g. "12 chapters · 3 images" or "8 notes · 2 notebooks".
    pub summary: String,
    /// Uncompressed payload size hint, in bytes.
    #[serde(default)]
    pub size_bytes: u64,
}

/// Body of `POST /share/offer`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShareOffer {
    pub sender_device_id: String,
    pub sender_device_name: String,
    pub manifest: ShareManifest,
}

/// Response to `POST /share/offer`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShareOfferResponse {
    pub accepted: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub upload_token: Option<String>,
    pub transfer_id: String,
}

/// Emitted to the desktop (`content-share-incoming`) when an offer is waiting
/// for the user's accept/decline decision.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IncomingTransferEvent {
    pub transfer_id: String,
    pub sender_device_id: String,
    pub sender_device_name: String,
    pub manifest: ShareManifest,
}

/// Emitted to the desktop (`content-share-received`) after a bundle has been
/// imported into the database.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReceivedEvent {
    pub kind: String,
    pub title: String,
    pub sender_device_name: String,
}

/// Result of importing a received bundle.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportSummary {
    pub kind: String,
    pub title: String,
}

/// Emitted to the desktop (`content-share-send-progress`) while sending: a
/// `waiting` phase (offer pending the peer's approval) followed by `uploading`
/// with running byte counts so the UI can show a progress bar.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SendProgress {
    pub device_id: String,
    pub phase: String,
    pub sent: u64,
    pub total: u64,
}

// ─── Bundle payload (inside the zip's `bundle.json`) ──────────────────────────

/// Top-level bundle descriptor. Exactly one of `library` / `notes` is set.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BundleFile {
    pub version: u32,
    pub kind: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub library: Option<LibraryBundle>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub notes: Option<NotesBundle>,
}

/// A whole book: metadata, every chapter with full content, translations,
/// bookmarks, and the per-chapter image records (bytes live under `images/`).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LibraryBundle {
    pub book: Book,
    pub chapters: Vec<Chapter>,
    #[serde(default)]
    pub translations: Vec<ChapterTranslation>,
    #[serde(default)]
    pub bookmarks: Vec<Bookmark>,
    #[serde(default)]
    pub images: Vec<BundledChapterImages>,
}

/// A notes subtree: the selected containers (ancestors + descendants), the
/// notes within, plus the labels and highlights they reference.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NotesBundle {
    #[serde(default)]
    pub projects: Vec<NoteProject>,
    #[serde(default)]
    pub notebooks: Vec<NoteNotebook>,
    #[serde(default)]
    pub sections: Vec<NoteSection>,
    #[serde(default)]
    pub topics: Vec<NoteTopic>,
    #[serde(default)]
    pub notes: Vec<Note>,
    #[serde(default)]
    pub labels: Vec<NoteLabel>,
    #[serde(default)]
    pub highlights: Vec<NoteHighlight>,
}

/// Per-chapter set of cached image records carried in a library bundle. The
/// referenced image bytes live in the zip under `images/<local_file>`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BundledChapterImages {
    pub chapter_id: String,
    pub records: Vec<CachedImageRecord>,
}
