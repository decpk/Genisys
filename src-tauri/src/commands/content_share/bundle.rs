//! Bundle assembly: read a book or a notes subtree out of the database (plus any
//! cached book images from disk) and pack it into an in-memory zip that another
//! Genisys device can import. The `zip` crate is synchronous, so callers run these
//! inside `tokio::task::spawn_blocking`.

use std::collections::{HashMap, HashSet};
use std::io::{Cursor, Write};
use std::path::Path;

use zip::write::SimpleFileOptions;
use zip::{CompressionMethod, ZipWriter};

use crate::commands::library::image_cache::{
    get_book_screenshots_dir, get_chapter_sidecar_path, read_images_sidecar,
};
use crate::database::{
    load_all_notes_db, load_book_with_chapters_db, load_bookmarks_for_chapter_db,
    load_chapter_content_db, load_chapter_translations_db, load_note_highlights_db,
    load_note_labels_db, load_note_notebooks_db, load_note_projects_db, load_note_sections_db,
    load_note_topics_db,
};
use crate::database::Database;
use crate::types::{Book, Bookmark, Note, NoteNotebook, NoteSection, NoteTopic};

use super::types::{
    BundleFile, BundledChapterImages, LibraryBundle, NotesBundle, ShareManifest,
};

const BUNDLE_VERSION: u32 = 1;

// ─── Library ──────────────────────────────────────────────────────────────────

/// Assemble a whole book (chapters with full content, translations, bookmarks,
/// and cached images) into a transferable zip.
pub fn build_library_bundle(db: &Database, book_id: &str) -> Result<(ShareManifest, Vec<u8>), String> {
    let loaded = load_book_with_chapters_db(db, book_id)
        .ok_or_else(|| "Book not found".to_string())?;
    let meta = loaded.book;

    let book = Book {
        id: meta.id.clone(),
        title: meta.title.clone(),
        description: meta.description,
        status: meta.status,
        chapter_count: meta.chapter_count,
        model: meta.model,
        language: meta.language,
        generation_duration_ms: meta.generation_duration_ms,
        created_at: meta.created_at,
        updated_at: meta.updated_at,
    };

    let mut chapters = loaded.chapters;
    let mut translations = Vec::new();
    let mut bookmarks: Vec<Bookmark> = Vec::new();
    let mut images: Vec<BundledChapterImages> = Vec::new();
    let mut image_bytes: HashMap<String, Vec<u8>> = HashMap::new();

    let screenshots_dir = get_book_screenshots_dir(book_id).ok();

    for chapter in chapters.iter_mut() {
        // Bulk load returns empty content for performance — fetch the real text.
        if let Some(content) = load_chapter_content_db(db, &chapter.id) {
            chapter.content = content;
        }

        for t in load_chapter_translations_db(db, &chapter.id) {
            if !t.content.is_empty() {
                translations.push(t);
            }
        }

        for bm in load_bookmarks_for_chapter_db(db, &chapter.id) {
            bookmarks.push(Bookmark {
                id: bm.id,
                book_id: bm.book_id,
                chapter_id: bm.chapter_id,
                highlight_id: bm.highlight_id,
                label: bm.label,
                note: bm.note,
                created_at: bm.created_at,
            });
        }

        // Cached images for this chapter, if any.
        if let (Some(dir), Ok(sidecar_path)) =
            (screenshots_dir.as_ref(), get_chapter_sidecar_path(book_id, &chapter.id))
        {
            if let Some(sidecar) = read_images_sidecar(&sidecar_path) {
                let mut records = Vec::new();
                for rec in sidecar.images {
                    if rec.status != "ok" || rec.local_file.is_empty() {
                        continue;
                    }
                    let src = dir.join(&rec.local_file);
                    if let Ok(bytes) = std::fs::read(&src) {
                        image_bytes.entry(rec.local_file.clone()).or_insert(bytes);
                        records.push(rec);
                    }
                }
                if !records.is_empty() {
                    images.push(BundledChapterImages {
                        chapter_id: chapter.id.clone(),
                        records,
                    });
                }
            }
        }
    }

    let chapter_count = chapters.len();
    let image_count = image_bytes.len();

    let bundle = BundleFile {
        version: BUNDLE_VERSION,
        kind: "library".to_string(),
        library: Some(LibraryBundle {
            book,
            chapters,
            translations,
            bookmarks,
            images,
        }),
        notes: None,
    };

    let zip_bytes = write_bundle_zip(&bundle, &image_bytes)?;
    let summary = if image_count > 0 {
        format!("{chapter_count} chapters · {image_count} images")
    } else {
        format!("{chapter_count} chapters")
    };
    let manifest = ShareManifest {
        kind: "library".to_string(),
        title: meta.title,
        summary,
        size_bytes: zip_bytes.len() as u64,
    };
    Ok((manifest, zip_bytes))
}

// ─── Notes ────────────────────────────────────────────────────────────────────

/// Assemble a notes selection into a transferable zip. `kind` is one of
/// `note` | `topic` | `section` | `notebook` | `project` | `all`; `id` is the
/// root id for everything but `all`. The bundle includes the selected item's
/// ancestor containers (so structure is recreated) and all descendants.
pub fn build_notes_bundle(
    db: &Database,
    kind: &str,
    id: Option<&str>,
) -> Result<(ShareManifest, Vec<u8>), String> {
    let all_projects = load_note_projects_db(db);
    let all_notebooks = load_note_notebooks_db(db);
    let all_sections = load_note_sections_db(db, None);
    let all_topics = load_note_topics_db(db, None);
    let all_notes: Vec<Note> = load_all_notes_db(db)
        .into_iter()
        .filter(|n| !n.is_trashed)
        .collect();
    let all_labels = load_note_labels_db(db);

    let mut inc_projects: HashSet<String> = HashSet::new();
    let mut inc_notebooks: HashSet<String> = HashSet::new();
    let mut inc_sections: HashSet<String> = HashSet::new();
    let mut inc_topics: HashSet<String> = HashSet::new();
    let mut inc_notes: Vec<Note> = Vec::new();

    let title: String;

    match kind {
        "all" => {
            for p in &all_projects {
                inc_projects.insert(p.id.clone());
            }
            for nb in &all_notebooks {
                inc_notebooks.insert(nb.id.clone());
            }
            for s in &all_sections {
                inc_sections.insert(s.id.clone());
            }
            for t in &all_topics {
                inc_topics.insert(t.id.clone());
            }
            inc_notes = all_notes.clone();
            title = "All notes".to_string();
        }
        "project" => {
            let pid = id.ok_or_else(|| "project id required".to_string())?;
            inc_projects.insert(pid.to_string());
            for nb in all_notebooks.iter().filter(|n| n.project_id.as_deref() == Some(pid)) {
                inc_notebooks.insert(nb.id.clone());
            }
            for s in all_sections.iter().filter(|s| inc_notebooks.contains(&s.notebook_id)) {
                inc_sections.insert(s.id.clone());
            }
            for t in all_topics.iter().filter(|t| inc_sections.contains(&t.section_id)) {
                inc_topics.insert(t.id.clone());
            }
            collect_notes_in_containers(&all_notes, &inc_notebooks, &inc_sections, &inc_topics, &mut inc_notes);
            let name = all_projects.iter().find(|p| p.id == pid).map(|p| p.name.clone()).unwrap_or_default();
            title = format!("Project: {name}");
        }
        "notebook" => {
            let nid = id.ok_or_else(|| "notebook id required".to_string())?;
            inc_notebooks.insert(nid.to_string());
            add_notebook_ancestors(&all_notebooks, nid, &mut inc_projects);
            for s in all_sections.iter().filter(|s| s.notebook_id == nid) {
                inc_sections.insert(s.id.clone());
            }
            for t in all_topics.iter().filter(|t| inc_sections.contains(&t.section_id)) {
                inc_topics.insert(t.id.clone());
            }
            collect_notes_in_containers(&all_notes, &inc_notebooks, &inc_sections, &inc_topics, &mut inc_notes);
            let name = all_notebooks.iter().find(|n| n.id == nid).map(|n| n.name.clone()).unwrap_or_default();
            title = format!("Notebook: {name}");
        }
        "section" => {
            let sid = id.ok_or_else(|| "section id required".to_string())?;
            inc_sections.insert(sid.to_string());
            add_section_ancestors(&all_sections, &all_notebooks, sid, &mut inc_notebooks, &mut inc_projects);
            for t in all_topics.iter().filter(|t| t.section_id == sid) {
                inc_topics.insert(t.id.clone());
            }
            collect_notes_in_containers(&all_notes, &inc_notebooks, &inc_sections, &inc_topics, &mut inc_notes);
            let name = all_sections.iter().find(|s| s.id == sid).map(|s| s.name.clone()).unwrap_or_default();
            title = format!("Section: {name}");
        }
        "topic" => {
            let tid = id.ok_or_else(|| "topic id required".to_string())?;
            inc_topics.insert(tid.to_string());
            add_topic_ancestors(&all_topics, &all_sections, &all_notebooks, tid, &mut inc_sections, &mut inc_notebooks, &mut inc_projects);
            collect_notes_in_containers(&all_notes, &inc_notebooks, &inc_sections, &inc_topics, &mut inc_notes);
            let name = all_topics.iter().find(|t| t.id == tid).map(|t| t.name.clone()).unwrap_or_default();
            title = format!("Topic: {name}");
        }
        "note" => {
            let note_id = id.ok_or_else(|| "note id required".to_string())?;
            let note = all_notes
                .iter()
                .find(|n| n.id == note_id)
                .cloned()
                .ok_or_else(|| "Note not found".to_string())?;
            // Include the note's ancestor chain so it lands in the same structure.
            if let Some(t) = &note.topic_id {
                inc_topics.insert(t.clone());
                add_topic_ancestors(&all_topics, &all_sections, &all_notebooks, t, &mut inc_sections, &mut inc_notebooks, &mut inc_projects);
            } else if let Some(s) = &note.section_id {
                inc_sections.insert(s.clone());
                add_section_ancestors(&all_sections, &all_notebooks, s, &mut inc_notebooks, &mut inc_projects);
            } else if let Some(nb) = &note.notebook_id {
                inc_notebooks.insert(nb.clone());
                add_notebook_ancestors(&all_notebooks, nb, &mut inc_projects);
            }
            title = if note.title.trim().is_empty() {
                "Untitled note".to_string()
            } else {
                note.title.clone()
            };
            inc_notes.push(note);
        }
        other => return Err(format!("unknown notes selection kind: {other}")),
    }

    // Filter containers to the included sets.
    let projects: Vec<_> = all_projects.into_iter().filter(|p| inc_projects.contains(&p.id)).collect();
    let notebooks: Vec<_> = all_notebooks.into_iter().filter(|n| inc_notebooks.contains(&n.id)).collect();
    let sections: Vec<_> = all_sections.into_iter().filter(|s| inc_sections.contains(&s.id)).collect();
    let topics: Vec<_> = all_topics.into_iter().filter(|t| inc_topics.contains(&t.id)).collect();

    // Labels referenced by the included notes.
    let mut label_ids: HashSet<String> = HashSet::new();
    for n in &inc_notes {
        for l in &n.labels {
            label_ids.insert(l.clone());
        }
    }
    let labels: Vec<_> = all_labels.into_iter().filter(|l| label_ids.contains(&l.id)).collect();

    // Highlights for the included notes.
    let mut highlights = Vec::new();
    for n in &inc_notes {
        for h in load_note_highlights_db(db, &n.id) {
            highlights.push(h);
        }
    }

    let note_count = inc_notes.len();
    let notebook_count = notebooks.len();

    let bundle = BundleFile {
        version: BUNDLE_VERSION,
        kind: "notes".to_string(),
        library: None,
        notes: Some(NotesBundle {
            projects,
            notebooks,
            sections,
            topics,
            notes: inc_notes,
            labels,
            highlights,
        }),
    };

    let zip_bytes = write_bundle_zip(&bundle, &HashMap::new())?;
    let note_word = if note_count == 1 { "note" } else { "notes" };
    let summary = if notebook_count > 0 {
        format!("{note_count} {note_word} · {notebook_count} notebooks")
    } else {
        format!("{note_count} {note_word}")
    };
    let manifest = ShareManifest {
        kind: "notes".to_string(),
        title,
        summary,
        size_bytes: zip_bytes.len() as u64,
    };
    Ok((manifest, zip_bytes))
}

/// Add every non-trashed note that lives in any of the included containers.
fn collect_notes_in_containers(
    all_notes: &[Note],
    inc_notebooks: &HashSet<String>,
    inc_sections: &HashSet<String>,
    inc_topics: &HashSet<String>,
    out: &mut Vec<Note>,
) {
    for n in all_notes {
        let in_subtree = n.topic_id.as_ref().map_or(false, |t| inc_topics.contains(t))
            || n.section_id.as_ref().map_or(false, |s| inc_sections.contains(s))
            || n.notebook_id.as_ref().map_or(false, |nb| inc_notebooks.contains(nb));
        if in_subtree {
            out.push(n.clone());
        }
    }
}

/// Add a notebook's parent project (if any) to the included set.
fn add_notebook_ancestors(
    all_notebooks: &[NoteNotebook],
    nb_id: &str,
    inc_projects: &mut HashSet<String>,
) {
    if let Some(nb) = all_notebooks.iter().find(|n| n.id == nb_id) {
        if let Some(p) = &nb.project_id {
            inc_projects.insert(p.clone());
        }
    }
}

/// Add a section's parent notebook (and its project) to the included sets.
fn add_section_ancestors(
    all_sections: &[NoteSection],
    all_notebooks: &[NoteNotebook],
    s_id: &str,
    inc_notebooks: &mut HashSet<String>,
    inc_projects: &mut HashSet<String>,
) {
    if let Some(sec) = all_sections.iter().find(|s| s.id == s_id) {
        inc_notebooks.insert(sec.notebook_id.clone());
        add_notebook_ancestors(all_notebooks, &sec.notebook_id, inc_projects);
    }
}

/// Add a topic's parent section (and its notebook + project) to the included sets.
fn add_topic_ancestors(
    all_topics: &[NoteTopic],
    all_sections: &[NoteSection],
    all_notebooks: &[NoteNotebook],
    t_id: &str,
    inc_sections: &mut HashSet<String>,
    inc_notebooks: &mut HashSet<String>,
    inc_projects: &mut HashSet<String>,
) {
    if let Some(top) = all_topics.iter().find(|t| t.id == t_id) {
        inc_sections.insert(top.section_id.clone());
        add_section_ancestors(all_sections, all_notebooks, &top.section_id, inc_notebooks, inc_projects);
    }
}

// ─── Zip writer ───────────────────────────────────────────────────────────────

/// Pack `bundle.json` plus any image bytes (`images/<local_file>`) into an
/// in-memory zip. Image entries are Stored (already-compressed formats).
fn write_bundle_zip(bundle: &BundleFile, images: &HashMap<String, Vec<u8>>) -> Result<Vec<u8>, String> {
    let cursor = Cursor::new(Vec::<u8>::new());
    let mut zip = ZipWriter::new(cursor);

    let json_opts = SimpleFileOptions::default()
        .compression_method(CompressionMethod::Deflated)
        .large_file(true);
    let json = serde_json::to_vec(bundle).map_err(|e| e.to_string())?;
    zip.start_file("bundle.json", json_opts).map_err(|e| e.to_string())?;
    zip.write_all(&json).map_err(|e| e.to_string())?;

    let img_opts = SimpleFileOptions::default()
        .compression_method(CompressionMethod::Stored)
        .large_file(true);
    for (name, bytes) in images {
        let safe = sanitize_image_name(name);
        if safe.is_empty() {
            continue;
        }
        zip.start_file(format!("images/{safe}"), img_opts).map_err(|e| e.to_string())?;
        zip.write_all(bytes).map_err(|e| e.to_string())?;
    }

    let cursor = zip.finish().map_err(|e| e.to_string())?;
    Ok(cursor.into_inner())
}

/// Reduce a stored image name to a safe basename (anti zip-slip / traversal).
fn sanitize_image_name(name: &str) -> String {
    Path::new(name)
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .replace(['/', '\\'], "_")
}
