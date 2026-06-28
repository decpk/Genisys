//! Import a received bundle into the local database as a fresh copy: every
//! entity gets a brand-new id, foreign keys are remapped, book images are
//! written under the new book's screenshots dir, and note labels are matched to
//! existing labels by name (or created). Runs inside `spawn_blocking`.

use std::collections::HashMap;
use std::io::{Cursor, Read};
use std::path::Path;

use chrono::Utc;
use uuid::Uuid;
use zip::ZipArchive;

use crate::commands::library::image_cache::{
    get_book_screenshots_dir, get_chapter_sidecar_path, ImagesSidecar,
};
use crate::database::{
    load_note_labels_db, load_note_notebooks_db, load_note_projects_db, save_book_db,
    save_bookmark_db, save_chapter_db, save_chapter_translation_db, save_note_db,
    save_note_highlight_db, save_note_label_db, save_note_notebook_db, save_note_project_db,
    save_note_section_db, save_note_topic_db, Database,
};
use crate::types::{NoteLabel, NoteNotebook, NoteProject};

use super::types::{BundleFile, ImportSummary, LibraryBundle, NotesBundle};

const SHARED_INBOX_NAME: &str = "Shared with me";

fn now() -> String {
    Utc::now().to_rfc3339()
}

fn new_id() -> String {
    Uuid::new_v4().simple().to_string()
}

/// Parse a received zip and import its book or notes into the database.
pub fn import_bundle(db: &Database, zip_bytes: Vec<u8>) -> Result<ImportSummary, String> {
    let mut archive =
        ZipArchive::new(Cursor::new(zip_bytes)).map_err(|e| format!("invalid bundle: {e}"))?;

    let bundle: BundleFile = {
        let mut f = archive
            .by_name("bundle.json")
            .map_err(|_| "bundle.json missing from bundle".to_string())?;
        let mut s = String::new();
        f.read_to_string(&mut s).map_err(|e| e.to_string())?;
        serde_json::from_str(&s).map_err(|e| format!("bad bundle.json: {e}"))?
    };

    match bundle.kind.as_str() {
        "library" => {
            let lib = bundle.library.ok_or_else(|| "missing library payload".to_string())?;
            import_library(db, lib, &mut archive)
        }
        "notes" => {
            let notes = bundle.notes.ok_or_else(|| "missing notes payload".to_string())?;
            import_notes(db, notes)
        }
        other => Err(format!("unknown bundle kind: {other}")),
    }
}

// ─── Library ──────────────────────────────────────────────────────────────────

fn import_library(
    db: &Database,
    lib: LibraryBundle,
    archive: &mut ZipArchive<Cursor<Vec<u8>>>,
) -> Result<ImportSummary, String> {
    let now_s = now();
    let new_book_id = new_id();
    let title = lib.book.title.clone();

    let mut book = lib.book;
    let old_book_id = book.id.clone();
    book.id = new_book_id.clone();
    book.updated_at = now_s.clone();
    // The receiver isn't generating — never leave the copy stuck "generating".
    if book.status == "generating" {
        book.status = "completed".to_string();
    }
    save_book_db(db, &book);

    // Cached-image URLs are baked into the markdown as
    // `library-image://<book_id>/<file>`; repoint them at the new book id so the
    // receiver's scheme handler finds the imported image files on disk.
    let old_prefix = format!("library-image://{old_book_id}/");
    let new_prefix = format!("library-image://{new_book_id}/");
    let rewrite_image_urls = |s: &str| -> String {
        if old_book_id.is_empty() {
            s.to_string()
        } else {
            s.replace(&old_prefix, &new_prefix)
        }
    };

    // Chapters (old id -> new id).
    let mut chapter_map: HashMap<String, String> = HashMap::new();
    for ch in lib.chapters {
        let old = ch.id.clone();
        let mut c = ch;
        c.id = new_id();
        c.book_id = new_book_id.clone();
        c.content = rewrite_image_urls(&c.content);
        save_chapter_db(db, &c);
        chapter_map.insert(old, c.id);
    }

    // Translations.
    for t in lib.translations {
        if let Some(new_cid) = chapter_map.get(&t.chapter_id) {
            let mut tr = t;
            tr.id = new_id();
            tr.chapter_id = new_cid.clone();
            tr.content = rewrite_image_urls(&tr.content);
            save_chapter_translation_db(db, &tr);
        }
    }

    // Bookmarks.
    for bm in lib.bookmarks {
        if let Some(new_cid) = chapter_map.get(&bm.chapter_id) {
            let mut b = bm;
            b.id = new_id();
            b.book_id = new_book_id.clone();
            b.chapter_id = new_cid.clone();
            save_bookmark_db(db, &b);
        }
    }

    // Images: extract bytes into the new book's screenshots dir + rewrite sidecars.
    if !lib.images.is_empty() {
        if let Ok(dir) = get_book_screenshots_dir(&new_book_id) {
            for ci in lib.images {
                let new_cid = match chapter_map.get(&ci.chapter_id) {
                    Some(x) => x.clone(),
                    None => continue,
                };
                let mut records = Vec::new();
                for mut rec in ci.records {
                    let safe = sanitize_image_name(&rec.local_file);
                    if safe.is_empty() {
                        continue;
                    }
                    let entry = format!("images/{safe}");
                    let mut bytes = Vec::new();
                    let read_ok = match archive.by_name(&entry) {
                        Ok(mut f) => f.read_to_end(&mut bytes).is_ok(),
                        Err(_) => false,
                    };
                    if !read_ok {
                        continue;
                    }
                    if std::fs::write(dir.join(&safe), &bytes).is_ok() {
                        rec.local_file = safe.clone();
                        rec.local_url = format!("library-image://{new_book_id}/{safe}");
                        records.push(rec);
                    }
                }
                if !records.is_empty() {
                    if let Ok(sidecar_path) = get_chapter_sidecar_path(&new_book_id, &new_cid) {
                        if let Some(parent) = sidecar_path.parent() {
                            let _ = std::fs::create_dir_all(parent);
                        }
                        let sidecar = ImagesSidecar {
                            chapter_id: new_cid.clone(),
                            book_id: new_book_id.clone(),
                            updated_at: now(),
                            images: records,
                        };
                        let _ = std::fs::write(
                            &sidecar_path,
                            serde_json::to_string_pretty(&sidecar).unwrap_or_default(),
                        );
                    }
                }
            }
        }
    }

    Ok(ImportSummary {
        kind: "library".to_string(),
        title,
    })
}

// ─── Notes ────────────────────────────────────────────────────────────────────

fn import_notes(db: &Database, nb: NotesBundle) -> Result<ImportSummary, String> {
    let now_s = now();

    // Labels: reuse an existing label with the same (case-insensitive) name,
    // else create a fresh one. Build old-id -> resolved-id map.
    let mut by_name: HashMap<String, String> = HashMap::new();
    for l in load_note_labels_db(db) {
        by_name.insert(l.name.to_lowercase(), l.id);
    }
    let mut label_map: HashMap<String, String> = HashMap::new();
    for l in nb.labels {
        let key = l.name.to_lowercase();
        if let Some(existing) = by_name.get(&key) {
            label_map.insert(l.id, existing.clone());
        } else {
            let label = NoteLabel {
                id: new_id(),
                name: l.name,
                color: l.color,
                created_at: now_s.clone(),
            };
            save_note_label_db(db, &label);
            by_name.insert(key, label.id.clone());
            label_map.insert(l.id, label.id);
        }
    }

    // Projects.
    let mut project_map: HashMap<String, String> = HashMap::new();
    for p in nb.projects {
        let old = p.id.clone();
        let mut x = p;
        x.id = new_id();
        x.is_system = false;
        x.created_at = now_s.clone();
        x.updated_at = now_s.clone();
        save_note_project_db(db, &x);
        project_map.insert(old, x.id);
    }

    // Notebooks.
    let mut notebook_map: HashMap<String, String> = HashMap::new();
    for nbk in nb.notebooks {
        let old = nbk.id.clone();
        let mut x = nbk;
        x.id = new_id();
        x.is_system = false;
        x.project_id = x.project_id.and_then(|p| project_map.get(&p).cloned());
        x.created_at = now_s.clone();
        x.updated_at = now_s.clone();
        save_note_notebook_db(db, &x);
        notebook_map.insert(old, x.id);
    }

    // Sections.
    let mut section_map: HashMap<String, String> = HashMap::new();
    for s in nb.sections {
        let new_nb = match notebook_map.get(&s.notebook_id) {
            Some(x) => x.clone(),
            None => continue,
        };
        let old = s.id.clone();
        let mut x = s;
        x.id = new_id();
        x.notebook_id = new_nb;
        x.created_at = now_s.clone();
        x.updated_at = now_s.clone();
        save_note_section_db(db, &x);
        section_map.insert(old, x.id);
    }

    // Topics.
    let mut topic_map: HashMap<String, String> = HashMap::new();
    for t in nb.topics {
        let new_sec = match section_map.get(&t.section_id) {
            Some(x) => x.clone(),
            None => continue,
        };
        let old = t.id.clone();
        let mut x = t;
        x.id = new_id();
        x.section_id = new_sec;
        x.created_at = now_s.clone();
        x.updated_at = now_s.clone();
        save_note_topic_db(db, &x);
        topic_map.insert(old, x.id);
    }

    // Notes.
    let note_count = nb.notes.len();
    let mut note_map: HashMap<String, String> = HashMap::new();
    let mut shared_notebook_id: Option<String> = None;
    for note in nb.notes {
        let old = note.id.clone();
        let mut n = note;
        n.id = new_id();
        n.notebook_id = n.notebook_id.and_then(|x| notebook_map.get(&x).cloned());
        n.section_id = n.section_id.and_then(|x| section_map.get(&x).cloned());
        n.topic_id = n.topic_id.and_then(|x| topic_map.get(&x).cloned());
        n.labels = n
            .labels
            .into_iter()
            .filter_map(|l| label_map.get(&l).cloned())
            .collect();
        n.is_trashed = false;
        n.trashed_at = None;
        if n.created_at.is_empty() {
            n.created_at = now_s.clone();
        }
        n.updated_at = now_s.clone();

        // An unfiled note lands in a "Shared with me" notebook so it's findable.
        if n.notebook_id.is_none() && n.section_id.is_none() && n.topic_id.is_none() {
            if shared_notebook_id.is_none() {
                shared_notebook_id = Some(ensure_shared_notebook(db, &now_s));
            }
            n.notebook_id = shared_notebook_id.clone();
        }

        save_note_db(db, &n);
        note_map.insert(old, n.id);
    }

    // Highlights (remap note id).
    for h in nb.highlights {
        if let Some(new_nid) = note_map.get(&h.note_id) {
            let mut x = h;
            x.id = new_id();
            x.note_id = new_nid.clone();
            save_note_highlight_db(db, &x);
        }
    }

    let title = match note_count {
        1 => "1 note".to_string(),
        n => format!("{n} notes"),
    };
    Ok(ImportSummary {
        kind: "notes".to_string(),
        title,
    })
}

/// Find (or create once) the "Shared with me" notebook under a project of the
/// same name, returning its id. Used as the landing spot for unfiled notes.
fn ensure_shared_notebook(db: &Database, now_s: &str) -> String {
    if let Some(nb) = load_note_notebooks_db(db).into_iter().find(|n| n.name == SHARED_INBOX_NAME) {
        return nb.id;
    }
    let project_id = match load_note_projects_db(db).into_iter().find(|p| p.name == SHARED_INBOX_NAME) {
        Some(p) => p.id,
        None => {
            let p = NoteProject {
                id: new_id(),
                name: SHARED_INBOX_NAME.to_string(),
                color: None,
                icon: None,
                emoji: Some("📥".to_string()),
                is_system: false,
                is_favorite: false,
                sort_order: 0,
                sort_preference: None,
                created_at: now_s.to_string(),
                updated_at: now_s.to_string(),
            };
            save_note_project_db(db, &p);
            p.id
        }
    };
    let nb = NoteNotebook {
        id: new_id(),
        name: SHARED_INBOX_NAME.to_string(),
        color: None,
        icon: None,
        emoji: Some("📥".to_string()),
        is_system: false,
        sort_order: 0,
        project_id: Some(project_id),
        sort_preference: None,
        created_at: now_s.to_string(),
        updated_at: now_s.to_string(),
    };
    save_note_notebook_db(db, &nb);
    nb.id
}

/// Reduce a stored image name to a safe basename (anti zip-slip / traversal).
fn sanitize_image_name(name: &str) -> String {
    Path::new(name)
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .replace(['/', '\\'], "_")
}
