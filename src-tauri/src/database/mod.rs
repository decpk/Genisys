mod load_live_sports_tiles;
mod save_live_sports_tiles;
mod load_app_data;
mod save_app_data;
mod load_explorer_history;
mod save_explorer_repo;
mod remove_explorer_repo;
mod load_chat_history;
mod load_chat_list;
mod load_conversation_messages;
mod load_messages_for_api;
mod save_chat_conversation;
mod append_chat_message;
mod save_chat_message_annotation;
mod load_chat_message_annotations;
mod delete_chat_message_annotation;
mod set_chat_message_context_mode;
mod set_chat_messages_context_mode_bulk;
mod load_prompts;
mod save_prompt;
mod load_snippets;
mod save_snippet;
mod load_previewer_folders;
mod save_previewer_folder;
mod remove_previewer_folder;
mod load_previewer_previews;
mod save_previewer_preview;
mod remove_previewer_preview;
mod clear_all_previewer;
mod load_commands;
mod save_command;
mod execute_raw_query;
mod load_books;
mod save_book;
mod load_book_with_chapters;
mod load_chapter_content;
mod save_chapter;
mod save_chapter_translation;
mod load_chapter_translations;
mod load_chapter_translation_content;
mod remove_chapter_translation;
mod remove_book;
mod remove_chapter;
mod load_bookmarks;
mod save_bookmark;
mod remove_bookmark;
mod load_presentations;
mod save_presentation;
mod remove_presentation;
mod load_presentation_with_slides;
mod save_slide;
mod remove_slide;
mod reorder_slides;
mod load_pm_data;
mod save_pm_folder;
mod remove_pm_folder;
mod save_pm_category;
mod remove_pm_category;
mod save_pm_prompt;
mod remove_pm_prompt;
mod research;
mod save_tool_calls;
mod load_tool_calls;
mod load_tool_call_summaries;
mod load_tool_calls_by_message;
mod save_notification;
mod load_notifications;
mod remove_notifications;
mod count_notifications;
mod mark_notification_read;
mod load_news_tile;
mod save_news_tile;
mod load_news_interests;
mod save_news_interests;
mod load_news_articles;
mod save_news_articles;
mod load_stocks_tile;
mod save_stocks_tile;
mod load_stocks_watchlist;
mod save_stocks_watchlist;
mod delete_stocks_watch_item;
mod load_stocks_quote_cache;
mod save_stocks_quote_cache;
mod load_stocks_history_cache;
mod save_stocks_history_cache;
mod load_stocks_news;
mod save_stocks_news;
mod load_api_client_data;
mod load_api_request_body;
mod save_api_collection;
mod save_api_folder;
mod save_api_request;
mod remove_api_collection;
mod remove_api_folder;
mod remove_api_request;
mod save_api_environment;
mod save_api_environment_variable;
mod save_api_execution;
mod load_api_request_analytics;
mod save_api_cookies;
mod save_api_snapshots;
mod ai_assistant_sessions;
mod mock_load_variants;
mod mock_create_variant;
mod mock_update_variant;
mod mock_delete_variant;
mod mock_insert_request_log;
mod mock_load_request_logs;
mod mock_clear_request_logs;
mod mock_export_request_logs;
mod load_notes;
mod save_note;
mod remove_note;
mod save_note_highlight;
mod load_note_highlights;
mod remove_note_highlight;
mod remove_note_highlights_in_range;
mod search_notes;
mod load_note_notebooks;
mod save_note_notebook;
mod remove_note_notebook;
mod reorder_note_notebooks;
mod load_note_projects;
mod save_note_project;
mod remove_note_project;
mod reorder_note_projects;
mod move_note_notebook;
mod load_note_sections;
mod save_note_section;
mod remove_note_section;
mod reorder_note_sections;
mod move_note_section;
mod load_note_topics;
mod save_note_topic;
mod remove_note_topic;
mod reorder_note_topics;
mod move_note_topic;
mod load_note_labels;
mod save_note_label;
mod remove_note_label;
mod set_note_labels;
mod load_labels_for_note;
mod move_note;
mod reorder_notes;
mod toggle_note_favorite;
mod trash_note;
mod restore_note_from_trash;
mod empty_trash;
mod duplicate_note;
mod daily_plan;
mod daily_plan_reviews;
mod daily_plan_status;
mod load_webpages;
mod save_webpage;
mod remove_webpage;
mod update_webpage;
mod rename_webpage;
mod load_clipboard_items;
mod save_clipboard_item;
mod remove_clipboard_item;
mod update_clipboard_item;
mod prune_clipboard_items;
mod clear_clipboard_items;
mod count_clipboard_items;
mod create_clipboard_label;
mod load_clipboard_labels;
mod update_clipboard_label;
mod delete_clipboard_label;
mod add_label_to_clipboard_item;
mod remove_label_from_clipboard_item;
mod load_labels_for_clipboard_item;
mod seed_default_clipboard_labels;
mod update_clipboard_image_description;
mod update_clipboard_extracted_text;
mod fuzzy_search_clipboard;
mod move_clipboard_item_to_top;
mod load_clipboard_items_by_date;
mod load_clipboard_items_needing_analysis;
mod update_clipboard_analysis;
mod save_timer_session;
mod load_timer_sessions;
mod remove_timer_session;
mod save_timer_tag;
mod load_timer_tags;
mod remove_timer_tag;
mod save_timer_goal;
mod load_timer_goals;
mod save_usage_session;
mod get_usage_stats;
mod clear_usage_data;
mod save_timer_milestone;
mod load_timer_milestones;
mod get_timer_stats;

pub use daily_plan::*;
pub use daily_plan_reviews::*;
pub use daily_plan_status::*;
pub use load_live_sports_tiles::load_live_sports_tiles_db;
pub use save_live_sports_tiles::save_live_sports_tiles_db;
pub use load_app_data::load_app_data_db;
pub use save_app_data::save_app_data_db;
pub use load_explorer_history::load_explorer_history_db;
pub use save_explorer_repo::save_explorer_repo_db;
pub use remove_explorer_repo::remove_explorer_repo_db;
pub use load_chat_history::load_chat_history_db;
pub use load_chat_list::load_chat_list_db;
pub use load_conversation_messages::load_conversation_messages_db;
pub use load_messages_for_api::load_messages_for_api;
pub use save_chat_conversation::save_chat_conversation_db;
pub use append_chat_message::append_chat_message_db;
pub use save_chat_message_annotation::save_chat_message_annotation_db;
pub use load_chat_message_annotations::load_chat_message_annotations_db;
pub use delete_chat_message_annotation::delete_chat_message_annotation_db;
pub use set_chat_message_context_mode::set_chat_message_context_mode_db;
pub use set_chat_messages_context_mode_bulk::set_chat_messages_context_mode_bulk_db;
pub use load_prompts::load_prompts_db;
pub use save_prompt::save_prompt_db;
pub use load_snippets::load_snippets_db;
pub use save_snippet::save_snippet_db;
pub use load_previewer_folders::load_previewer_folders_db;
pub use save_previewer_folder::save_previewer_folder_db;
pub use remove_previewer_folder::remove_previewer_folder_db;
pub use load_previewer_previews::load_previewer_previews_db;
pub use save_previewer_preview::save_previewer_preview_db;
pub use remove_previewer_preview::remove_previewer_preview_db;
pub use clear_all_previewer::clear_all_previewer_db;
pub use load_commands::load_commands_db;
pub use save_command::save_command_db;
pub use execute_raw_query::{execute_raw_query_db, get_table_names_db};
pub use load_books::load_books_db;
pub use save_book::save_book_db;
pub use load_book_with_chapters::load_book_with_chapters_db;
pub use load_chapter_content::load_chapter_content_db;
pub use save_chapter::save_chapter_db;
pub use save_chapter_translation::save_chapter_translation_db;
pub use load_chapter_translations::load_chapter_translations_db;
pub use load_chapter_translation_content::load_chapter_translation_content_db;
pub use remove_chapter_translation::remove_chapter_translation_db;
pub use remove_book::remove_book_db;
pub use remove_chapter::remove_chapter_db;
pub use load_bookmarks::{load_bookmarks_db, load_bookmarks_for_chapter_db};
pub use save_bookmark::save_bookmark_db;
pub use remove_bookmark::remove_bookmark_db;
pub use load_presentations::load_presentations_db;
pub use save_presentation::save_presentation_db;
pub use remove_presentation::remove_presentation_db;
pub use load_presentation_with_slides::load_presentation_with_slides_db;
pub use save_slide::save_slide_db;
pub use remove_slide::remove_slide_db;
pub use reorder_slides::reorder_slides_db;
pub use load_webpages::load_webpages_db;
pub use save_webpage::save_webpage_db;
pub use remove_webpage::remove_webpage_db;
pub use update_webpage::{load_webpage_url_db, update_webpage_file_db};
pub use rename_webpage::rename_webpage_db;
pub use load_clipboard_items::load_clipboard_items_db;
pub use save_clipboard_item::save_clipboard_item_db;
pub use remove_clipboard_item::remove_clipboard_item_db;
pub use update_clipboard_item::{toggle_clipboard_pin_db, update_clipboard_text_db};
pub use prune_clipboard_items::prune_clipboard_items_db;
pub use clear_clipboard_items::clear_clipboard_items_db;
pub use count_clipboard_items::count_clipboard_items_db;
pub use create_clipboard_label::create_clipboard_label_db;
pub use load_clipboard_labels::load_clipboard_labels_db;
pub use update_clipboard_label::update_clipboard_label_db;
pub use delete_clipboard_label::{count_items_with_label_db, delete_clipboard_label_db};
pub use add_label_to_clipboard_item::add_label_to_clipboard_item_db;
pub use remove_label_from_clipboard_item::remove_label_from_clipboard_item_db;
pub use load_labels_for_clipboard_item::load_labels_for_clipboard_item_db;
pub use seed_default_clipboard_labels::seed_default_clipboard_labels_db;
pub use update_clipboard_image_description::update_clipboard_image_description_db;
pub use update_clipboard_extracted_text::update_clipboard_extracted_text_db;
pub use fuzzy_search_clipboard::fuzzy_search_clipboard_items_db;
pub use move_clipboard_item_to_top::move_clipboard_item_to_top_db;
pub use load_clipboard_items_by_date::load_clipboard_items_by_date_db;
pub use load_clipboard_items_needing_analysis::load_clipboard_items_needing_analysis_db;
pub use update_clipboard_analysis::update_clipboard_analysis_db;
pub use load_pm_data::load_pm_data_db;
pub use save_pm_folder::save_pm_folder_db;
pub use remove_pm_folder::remove_pm_folder_db;
pub use save_pm_category::save_pm_category_db;
pub use remove_pm_category::remove_pm_category_db;
pub use save_pm_prompt::save_pm_prompt_db;
pub use remove_pm_prompt::remove_pm_prompt_db;
pub use research::{
    load_research_sources_db, save_research_source_db, remove_research_source_db,
};
pub use save_tool_calls::save_tool_calls_db;
pub use load_tool_calls::load_tool_calls_db;
pub use load_tool_call_summaries::load_tool_call_summaries_db;
pub use load_tool_calls_by_message::load_tool_calls_by_message_db;
pub use save_notification::save_notification_db;
pub use load_notifications::load_notifications_db;
pub use remove_notifications::{remove_notification_db, remove_all_notifications_db};
pub use count_notifications::count_unread_notifications_db;
pub use mark_notification_read::{mark_notification_read_db, mark_all_notifications_read_db};
pub use load_news_tile::load_news_tile_db;
pub use save_news_tile::save_news_tile_db;
pub use load_news_interests::load_news_interests_db;
pub use save_news_interests::save_news_interests_db;
pub use load_news_articles::{load_news_articles_db, load_liked_news_articles_db};
pub use save_news_articles::{save_news_articles_db, toggle_news_article_liked_db, delete_news_articles_for_interest_db};
pub use load_stocks_tile::load_stocks_tile_db;
pub use save_stocks_tile::save_stocks_tile_db;
pub use load_stocks_watchlist::load_stocks_watchlist_db;
pub use save_stocks_watchlist::save_stocks_watchlist_db;
pub use delete_stocks_watch_item::delete_stocks_watch_item_db;
pub use load_stocks_quote_cache::load_stocks_quote_cache_db;
pub use save_stocks_quote_cache::save_stocks_quote_cache_db;
pub use load_stocks_history_cache::{load_stocks_history_cache_db, CachedStockHistory};
pub use save_stocks_history_cache::save_stocks_history_cache_db;
pub use load_stocks_news::load_stocks_news_db;
pub use save_stocks_news::save_stocks_news_db;
pub use load_api_client_data::load_api_client_data_db;
pub use load_api_request_body::load_api_request_body_db;
pub use save_api_collection::save_api_collection_db;
pub use save_api_folder::save_api_folder_db;
pub use save_api_request::save_api_request_db;
pub use remove_api_collection::remove_api_collection_db;
pub use remove_api_folder::remove_api_folder_db;
pub use remove_api_request::remove_api_request_db;
pub use save_api_environment::{save_api_environment_db, set_active_environment_db, remove_api_environment_db};
pub use save_api_environment_variable::{load_environment_variables_db, save_api_environment_variable_db, remove_api_environment_variable_db};
pub use save_api_execution::{save_api_execution_db, load_api_history_db, load_api_execution_response_db, remove_api_execution_db, clear_api_history_db};
pub use load_api_request_analytics::load_api_request_analytics_db;
pub use save_api_cookies::{load_api_cookies_db, load_api_cookie_jars_db, save_api_cookie_jar_db, save_api_cookie_db, remove_api_cookie_db, clear_api_cookie_jar_db};
pub use save_api_snapshots::{save_api_response_snapshot_db, load_api_response_snapshots_db, remove_api_response_snapshot_db, save_api_saved_example_db, load_api_saved_examples_db, remove_api_saved_example_db};
pub use ai_assistant_sessions::{load_ai_sessions_db, save_ai_session_db, remove_ai_session_db, clear_ai_sessions_db};
pub use mock_load_variants::mock_load_variants_db;
pub use mock_create_variant::mock_create_variant_db;
pub use mock_update_variant::mock_update_variant_db;
pub use mock_delete_variant::mock_delete_variant_db;
pub use mock_insert_request_log::mock_insert_request_log_db;
pub use mock_load_request_logs::mock_load_request_logs_db;
pub use mock_clear_request_logs::mock_clear_request_logs_db;
pub use mock_export_request_logs::mock_export_request_logs_db;
pub use load_notes::{load_notes_db, load_all_notes_db, load_trashed_notes_db};
pub use save_note::save_note_db;
pub use remove_note::remove_note_db;
pub use save_note_highlight::save_note_highlight_db;
pub use load_note_highlights::load_note_highlights_db;
pub use remove_note_highlight::remove_note_highlight_db;
pub use remove_note_highlights_in_range::remove_note_highlights_in_range_db;
pub use search_notes::search_note_titles_db;
pub use load_note_notebooks::load_note_notebooks_db;
pub use save_note_notebook::save_note_notebook_db;
pub use remove_note_notebook::remove_note_notebook_db;
pub use reorder_note_notebooks::reorder_note_notebooks_db;
pub use load_note_projects::load_note_projects_db;
pub use save_note_project::save_note_project_db;
pub use remove_note_project::remove_note_project_db;
pub use reorder_note_projects::reorder_note_projects_db;
pub use move_note_notebook::move_notebook_to_project_db;
pub use load_note_sections::load_note_sections_db;
pub use save_note_section::save_note_section_db;
pub use remove_note_section::remove_note_section_db;
pub use reorder_note_sections::reorder_note_sections_db;
pub use move_note_section::move_section_to_notebook_db;
pub use load_note_topics::load_note_topics_db;
pub use save_note_topic::save_note_topic_db;
pub use remove_note_topic::remove_note_topic_db;
pub use reorder_note_topics::reorder_note_topics_db;
pub use move_note_topic::move_topic_to_section_db;
pub use load_note_labels::load_note_labels_db;
pub use save_note_label::save_note_label_db;
pub use remove_note_label::remove_note_label_db;
pub use set_note_labels::set_note_labels_db;
pub use set_note_labels::set_note_labels_with_conn;
pub use load_labels_for_note::load_labels_for_note_db;
pub use load_labels_for_note::load_labels_for_note_with_conn;
pub use move_note::move_note_db;
pub use reorder_notes::reorder_notes_db;
pub use toggle_note_favorite::toggle_note_favorite_db;
pub use trash_note::trash_note_db;
pub use restore_note_from_trash::restore_note_from_trash_db;
pub use empty_trash::empty_trash_db;
pub use duplicate_note::duplicate_note_db;
pub use save_timer_session::save_timer_session_db;
pub use load_timer_sessions::load_timer_sessions_db;
pub use remove_timer_session::remove_timer_session_db;
pub use save_timer_tag::save_timer_tag_db;
pub use load_timer_tags::load_timer_tags_db;
pub use remove_timer_tag::remove_timer_tag_db;
pub use save_timer_goal::save_timer_goal_db;
pub use load_timer_goals::load_timer_goals_db;
pub use save_timer_milestone::save_timer_milestone_db;
pub use load_timer_milestones::load_timer_milestones_db;
pub use get_timer_stats::get_timer_stats_db;
pub use save_usage_session::save_usage_session_db;
pub use get_usage_stats::get_usage_stats_db;
pub use clear_usage_data::clear_usage_data_db;

use rusqlite::Connection;
use std::sync::Mutex;
use std::time::Duration;

pub(crate) const HISTORY_PAGE_SIZE: i64 = 10;

pub struct Database {
    write_conn: Mutex<Connection>,
    read_conn: Mutex<Connection>,
}

fn setup_connection(conn: &Connection, is_writer: bool) -> Result<(), String> {
    // Small busy_timeout to handle brief WAL auto-checkpoint contention.
    // The Rust Mutex serializes writes, so long waits should never happen.
    conn.busy_timeout(Duration::from_millis(500))
        .map_err(|e| format!("Failed to set busy_timeout: {e}"))?;

    // Set WAL mode individually and verify
    let mode: String = conn
        .pragma_update_and_check(None, "journal_mode", "WAL", |row| row.get(0))
        .map_err(|e| format!("Failed to set journal_mode: {e}"))?;
    println!("[db] journal_mode = {mode}");

    conn.execute_batch("PRAGMA foreign_keys = ON;")
        .map_err(|e| format!("Failed to set foreign_keys: {e}"))?;

    // NORMAL is safe in WAL mode and avoids the expensive double-fsync of FULL
    conn.execute_batch("PRAGMA synchronous = NORMAL;")
        .map_err(|e| format!("Failed to set synchronous: {e}"))?;

    if !is_writer {
        // Disable auto-checkpoint on the read connection to prevent it from
        // contending with the writer during WAL checkpoint
        conn.execute_batch("PRAGMA wal_autocheckpoint = 0;")
            .map_err(|e| format!("Failed to disable wal_autocheckpoint: {e}"))?;
    }

    Ok(())
}

impl Database {
    pub fn new(db_path: &str) -> Result<Self, String> {
        println!("[db] Opening database at: {db_path}");

        let write = Connection::open(db_path).map_err(|e| format!("Failed to open write connection: {e}"))?;
        setup_connection(&write, true)?;

        let read = Connection::open(db_path).map_err(|e| format!("Failed to open read connection: {e}"))?;
        setup_connection(&read, false)?;

        let db = Self {
            write_conn: Mutex::new(write),
            read_conn: Mutex::new(read),
        };
        db.create_tables()?;
        println!("[db] Database ready (WAL mode, dual connections)");
        Ok(db)
    }

    fn create_tables(&self) -> Result<(), String> {
        let conn = self.write_conn.lock().map_err(|e| e.to_string())?;

        // ── Pre-create rename migration: previewer_* → weblinks_* ─────────────
        // Runs BEFORE the CREATE TABLE batch so an existing user's saved data is
        // carried over (the table is renamed, keeping its rows) instead of a
        // fresh empty `weblinks_*` table being created alongside the old one.
        for (old_name, new_name) in [
            ("previewer_folders", "weblinks_folders"),
            ("previewer_previews", "weblinks_previews"),
        ] {
            let table_exists = |name: &str| -> bool {
                conn.query_row(
                    "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?1",
                    [name],
                    |_| Ok(()),
                )
                .is_ok()
            };
            if table_exists(old_name) && !table_exists(new_name) {
                let _ = conn.execute_batch(&format!("ALTER TABLE {old_name} RENAME TO {new_name};"));
            }
        }

        conn.execute_batch(
            "
            DROP TABLE IF EXISTS global_pr_history;
            DROP TABLE IF EXISTS reviewer_history;
            DROP TABLE IF EXISTS repo_folders;
            DROP TABLE IF EXISTS repo_folder_prs;
            DROP TABLE IF EXISTS dashboard_projects;

            CREATE TABLE IF NOT EXISTS explorer_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                repository TEXT NOT NULL,
                source TEXT NOT NULL,
                organization TEXT NOT NULL DEFAULT '',
                project TEXT NOT NULL DEFAULT '',
                local_path TEXT,
                last_opened_at TEXT NOT NULL
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_explorer_unique
                ON explorer_history(repository, organization, project, COALESCE(local_path, ''));
            CREATE INDEX IF NOT EXISTS idx_explorer_opened ON explorer_history(last_opened_at DESC);

            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL DEFAULT 'New Chat',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                message_count INTEGER NOT NULL DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                sort_order INTEGER NOT NULL,
                reasoning TEXT,
                activities_json TEXT,
                context_mode INTEGER,
                images TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_messages_conversation ON chat_messages(conversation_id, sort_order);

            CREATE TABLE IF NOT EXISTS chat_message_annotations (
                id TEXT PRIMARY KEY,
                message_id TEXT NOT NULL UNIQUE REFERENCES chat_messages(id) ON DELETE CASCADE,
                task_summary TEXT NOT NULL DEFAULT '',
                chosen_option TEXT NOT NULL DEFAULT '',
                reasoning TEXT NOT NULL DEFAULT '',
                alternatives TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_chat_message_annotations_message ON chat_message_annotations(message_id);

            CREATE TABLE IF NOT EXISTS live_sports_tiles (
                id TEXT PRIMARY KEY,
                query TEXT NOT NULL DEFAULT '',
                sport_key TEXT NOT NULL DEFAULT 'custom',
                created_at TEXT NOT NULL,
                refresh_interval_ms INTEGER NOT NULL DEFAULT 60000,
                tile_width TEXT NOT NULL DEFAULT 'half',
                source_url TEXT NOT NULL DEFAULT '',
                notify_on_score INTEGER NOT NULL DEFAULT 1,
                notify_on_status INTEGER NOT NULL DEFAULT 1,
                notify_on_period INTEGER NOT NULL DEFAULT 0,
                notify_when_focused TEXT NOT NULL DEFAULT 'os',
                notify_when_unfocused TEXT NOT NULL DEFAULT 'os',
                auto_delete_on_end INTEGER NOT NULL DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS prompts (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                content TEXT NOT NULL,
                tags TEXT NOT NULL DEFAULT '[]',
                is_favorite INTEGER NOT NULL DEFAULT 0,
                usage_count INTEGER NOT NULL DEFAULT 0,
                last_used_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                metadata TEXT NOT NULL DEFAULT '{}'
            );
            CREATE INDEX IF NOT EXISTS idx_prompts_favorite ON prompts(is_favorite);
            CREATE INDEX IF NOT EXISTS idx_prompts_updated ON prompts(updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_prompts_usage ON prompts(usage_count DESC);

            CREATE TABLE IF NOT EXISTS snippets (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                conversation_id TEXT,
                is_favorite INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS weblinks_folders (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                color TEXT NOT NULL DEFAULT '',
                parent_id TEXT,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_weblinks_folders_parent ON weblinks_folders(parent_id);

            CREATE TABLE IF NOT EXISTS weblinks_previews (
                id TEXT PRIMARY KEY,
                folder_id TEXT,
                url TEXT NOT NULL,
                final_url TEXT NOT NULL DEFAULT '',
                title TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                site_name TEXT NOT NULL DEFAULT '',
                favicon_url TEXT NOT NULL DEFAULT '',
                image_url TEXT NOT NULL DEFAULT '',
                theme_color TEXT NOT NULL DEFAULT '',
                embeddable TEXT NOT NULL DEFAULT 'unknown',
                notes TEXT NOT NULL DEFAULT '',
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_weblinks_previews_folder ON weblinks_previews(folder_id);
            CREATE INDEX IF NOT EXISTS idx_weblinks_previews_created ON weblinks_previews(created_at DESC);

            CREATE TABLE IF NOT EXISTS books (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'generating',
                chapter_count INTEGER NOT NULL DEFAULT 0,
                language TEXT NOT NULL DEFAULT 'english',
                generation_duration_ms INTEGER,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_books_updated ON books(updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);

            CREATE TABLE IF NOT EXISTS chapters (
                id TEXT PRIMARY KEY,
                book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
                chapter_number INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'pending',
                sort_order INTEGER NOT NULL,
                is_read INTEGER NOT NULL DEFAULT 0,
                language TEXT NOT NULL DEFAULT 'english',
                generation_duration_ms INTEGER,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_chapters_book ON chapters(book_id, sort_order);
            CREATE INDEX IF NOT EXISTS idx_chapters_status ON chapters(book_id, status);

            CREATE TABLE IF NOT EXISTS chapter_translations (
                id TEXT PRIMARY KEY,
                chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
                language TEXT NOT NULL,
                content TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_chapter_translations_unique ON chapter_translations(chapter_id, language);
            CREATE INDEX IF NOT EXISTS idx_chapter_translations_chapter ON chapter_translations(chapter_id);

            CREATE TABLE IF NOT EXISTS bookmarks (
                id TEXT PRIMARY KEY,
                book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
                chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
                highlight_id TEXT NOT NULL,
                label TEXT NOT NULL,
                note TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_bookmarks_book ON bookmarks(book_id);
            CREATE INDEX IF NOT EXISTS idx_bookmarks_chapter ON bookmarks(chapter_id);
            CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_unique ON bookmarks(chapter_id, highlight_id);
            CREATE INDEX IF NOT EXISTS idx_bookmarks_created ON bookmarks(created_at DESC);

            CREATE TABLE IF NOT EXISTS presentations (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                slide_count INTEGER NOT NULL DEFAULT 0,
                theme TEXT NOT NULL DEFAULT 'default',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_presentations_updated ON presentations(updated_at DESC);

            CREATE TABLE IF NOT EXISTS slides (
                id TEXT PRIMARY KEY,
                presentation_id TEXT NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
                sort_order INTEGER NOT NULL,
                title TEXT NOT NULL DEFAULT '',
                notes TEXT NOT NULL DEFAULT '',
                data TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_slides_presentation ON slides(presentation_id, sort_order);

            CREATE TABLE IF NOT EXISTS pm_folders (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                color TEXT NOT NULL DEFAULT '',
                scopes_json TEXT NOT NULL DEFAULT '[]',
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_pm_folders_sort ON pm_folders(sort_order);

            CREATE TABLE IF NOT EXISTS pm_categories (
                id TEXT PRIMARY KEY,
                folder_id TEXT NOT NULL REFERENCES pm_folders(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                icon TEXT NOT NULL DEFAULT '',
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_pm_categories_folder ON pm_categories(folder_id, sort_order);

            CREATE TABLE IF NOT EXISTS pm_prompts (
                id TEXT PRIMARY KEY,
                category_id TEXT NOT NULL REFERENCES pm_categories(id) ON DELETE CASCADE,
                folder_id TEXT NOT NULL REFERENCES pm_folders(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                content TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                is_pinned INTEGER NOT NULL DEFAULT 0,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                app_scopes TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_pm_prompts_category ON pm_prompts(category_id, sort_order);
            CREATE INDEX IF NOT EXISTS idx_pm_prompts_folder ON pm_prompts(folder_id);
            CREATE INDEX IF NOT EXISTS idx_pm_prompts_pinned ON pm_prompts(folder_id, is_pinned DESC);

            CREATE TABLE IF NOT EXISTS research_sources (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                source_type TEXT NOT NULL,
                path TEXT,
                name TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_research_sources_session ON research_sources(session_id);

            CREATE TABLE IF NOT EXISTS tool_calls (
                id TEXT PRIMARY KEY,
                message_id TEXT NOT NULL,
                conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                tool_name TEXT NOT NULL,
                args TEXT NOT NULL DEFAULT '{}',
                result TEXT,
                status TEXT NOT NULL DEFAULT 'done',
                started_at TEXT NOT NULL,
                completed_at TEXT,
                sort_order INTEGER NOT NULL DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS idx_tool_calls_conversation ON tool_calls(conversation_id, started_at);
            CREATE INDEX IF NOT EXISTS idx_tool_calls_message ON tool_calls(message_id, sort_order);

            CREATE TABLE IF NOT EXISTS commands (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                tool_name TEXT NOT NULL,
                args_template TEXT NOT NULL DEFAULT '{}',
                is_built_in INTEGER NOT NULL DEFAULT 0,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL DEFAULT 'info',
                channel TEXT NOT NULL DEFAULT 'app',
                source TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                icon TEXT,
                actions TEXT,
                meta TEXT,
                read INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                expires_at TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_notifications_source ON notifications(source);
            CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
            CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
            CREATE INDEX IF NOT EXISTS idx_notifications_channel ON notifications(channel);

            CREATE TABLE IF NOT EXISTS news_tiles (
                id TEXT PRIMARY KEY,
                tile_width TEXT NOT NULL DEFAULT 'full',
                refresh_interval_ms INTEGER NOT NULL DEFAULT 86400000,
                last_refreshed_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS news_interests (
                id TEXT PRIMARY KEY,
                tile_id TEXT NOT NULL REFERENCES news_tiles(id) ON DELETE CASCADE,
                category_key TEXT NOT NULL,
                label TEXT NOT NULL,
                custom_prompt TEXT NOT NULL DEFAULT '',
                resolved_url TEXT,
                position INTEGER NOT NULL DEFAULT 0,
                last_refreshed_at TEXT,
                created_at TEXT NOT NULL,
                UNIQUE(tile_id, label)
            );
            CREATE INDEX IF NOT EXISTS idx_news_interests_tile ON news_interests(tile_id, position);

            CREATE TABLE IF NOT EXISTS news_articles (
                id TEXT PRIMARY KEY,
                interest_id TEXT NOT NULL REFERENCES news_interests(id) ON DELETE CASCADE,
                source_type TEXT NOT NULL,
                title TEXT NOT NULL,
                summary TEXT NOT NULL DEFAULT '',
                url TEXT NOT NULL,
                source_name TEXT NOT NULL DEFAULT '',
                author TEXT NOT NULL DEFAULT '',
                published_at TEXT,
                fetched_at TEXT NOT NULL,
                is_liked INTEGER NOT NULL DEFAULT 0,
                liked_at TEXT,
                raw_hash TEXT NOT NULL,
                extras_json TEXT NOT NULL DEFAULT '{}',
                UNIQUE(interest_id, raw_hash)
            );
            CREATE INDEX IF NOT EXISTS idx_news_articles_interest ON news_articles(interest_id, fetched_at DESC);
            CREATE INDEX IF NOT EXISTS idx_news_articles_liked ON news_articles(interest_id, is_liked);

            -- ═══════════════════════════════════════════════════════════
            -- STOCKS TILE SCHEMA
            -- ═══════════════════════════════════════════════════════════
            CREATE TABLE IF NOT EXISTS stocks_tile (
                id TEXT PRIMARY KEY,
                tile_width TEXT NOT NULL DEFAULT 'half',
                refresh_interval_ms INTEGER NOT NULL DEFAULT 60000,
                auto_refresh_enabled INTEGER NOT NULL DEFAULT 1,
                last_refreshed_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS stocks_watchlist (
                id TEXT PRIMARY KEY,
                tile_id TEXT NOT NULL,
                symbol TEXT NOT NULL,
                short_name TEXT NOT NULL DEFAULT '',
                long_name TEXT NOT NULL DEFAULT '',
                exchange TEXT NOT NULL DEFAULT '',
                quote_type TEXT NOT NULL DEFAULT 'EQUITY',
                custom_news_url TEXT,
                custom_price_url TEXT,
                alert_above REAL,
                alert_below REAL,
                alert_enabled INTEGER NOT NULL DEFAULT 0,
                position INTEGER NOT NULL DEFAULT 0,
                last_refreshed_at TEXT,
                created_at TEXT NOT NULL,
                UNIQUE(tile_id, symbol),
                FOREIGN KEY(tile_id) REFERENCES stocks_tile(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_stocks_watchlist_tile ON stocks_watchlist(tile_id, position);

            CREATE TABLE IF NOT EXISTS stocks_quote_cache (
                symbol TEXT PRIMARY KEY,
                price REAL NOT NULL,
                prev_close REAL NOT NULL,
                change_pct REAL NOT NULL,
                day_high REAL,
                day_low REAL,
                day_open REAL,
                volume INTEGER,
                fifty_two_week_high REAL,
                fifty_two_week_low REAL,
                currency TEXT NOT NULL DEFAULT 'USD',
                market_state TEXT NOT NULL DEFAULT '',
                fetched_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS stocks_history_cache (
                symbol TEXT NOT NULL,
                range_key TEXT NOT NULL,
                points_json TEXT NOT NULL,
                fetched_at TEXT NOT NULL,
                PRIMARY KEY(symbol, range_key)
            );

            CREATE TABLE IF NOT EXISTS stocks_news (
                id TEXT PRIMARY KEY,
                watchlist_id TEXT NOT NULL,
                source_type TEXT NOT NULL DEFAULT 'yahoo',
                title TEXT NOT NULL,
                summary TEXT NOT NULL DEFAULT '',
                why_it_matters TEXT NOT NULL DEFAULT '',
                url TEXT NOT NULL,
                publisher TEXT NOT NULL DEFAULT '',
                published_at TEXT,
                fetched_at TEXT NOT NULL,
                raw_hash TEXT NOT NULL,
                UNIQUE(watchlist_id, raw_hash),
                FOREIGN KEY(watchlist_id) REFERENCES stocks_watchlist(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_stocks_news_watchlist ON stocks_news(watchlist_id, fetched_at DESC);

            -- ═══════════════════════════════════════════════════════════
            -- API CLIENT SCHEMA
            -- ═══════════════════════════════════════════════════════════

            -- ─── Workspaces ──────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS workspaces (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                is_default INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            -- ─── Environments ────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_environments (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL DEFAULT 'default' REFERENCES workspaces(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                base_url TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                color TEXT NOT NULL DEFAULT '',
                is_active INTEGER NOT NULL DEFAULT 0,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_environments_workspace ON api_environments(workspace_id, is_active);
            CREATE INDEX IF NOT EXISTS idx_api_environments_sort ON api_environments(workspace_id, sort_order);

            -- ─── Environment Variables ───────────────────────────────
            CREATE TABLE IF NOT EXISTS api_environment_variables (
                id TEXT PRIMARY KEY,
                environment_id TEXT NOT NULL REFERENCES api_environments(id) ON DELETE CASCADE,
                key TEXT NOT NULL,
                value TEXT NOT NULL DEFAULT '',
                initial_value TEXT NOT NULL DEFAULT '',
                is_secret INTEGER NOT NULL DEFAULT 0,
                description TEXT NOT NULL DEFAULT '',
                enabled INTEGER NOT NULL DEFAULT 1,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(environment_id, key)
            );
            CREATE INDEX IF NOT EXISTS idx_api_env_vars_env ON api_environment_variables(environment_id, sort_order);

            -- ─── Collections (enhanced) ──────────────────────────────
            CREATE TABLE IF NOT EXISTS api_collections (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL DEFAULT 'default' REFERENCES workspaces(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                color TEXT NOT NULL DEFAULT '',
                sort_order INTEGER NOT NULL DEFAULT 0,
                deleted_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_collections_workspace ON api_collections(workspace_id, sort_order);
            CREATE INDEX IF NOT EXISTS idx_api_collections_sort ON api_collections(sort_order);

            -- ─── Folders (enhanced) ──────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_folders (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL DEFAULT 'default' REFERENCES workspaces(id) ON DELETE CASCADE,
                collection_id TEXT NOT NULL REFERENCES api_collections(id) ON DELETE CASCADE,
                parent_folder_id TEXT REFERENCES api_folders(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0,
                deleted_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_folders_collection ON api_folders(collection_id, sort_order);
            CREATE INDEX IF NOT EXISTS idx_api_folders_parent ON api_folders(parent_folder_id);

            -- ─── Requests (enhanced) ─────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_requests (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL DEFAULT 'default' REFERENCES workspaces(id) ON DELETE CASCADE,
                collection_id TEXT NOT NULL REFERENCES api_collections(id) ON DELETE CASCADE,
                folder_id TEXT REFERENCES api_folders(id) ON DELETE SET NULL,
                name TEXT NOT NULL,
                method TEXT NOT NULL DEFAULT 'GET',
                url TEXT NOT NULL DEFAULT '',
                params TEXT NOT NULL DEFAULT '[]',
                headers TEXT NOT NULL DEFAULT '[]',
                body_type TEXT NOT NULL DEFAULT 'none',
                body_content TEXT NOT NULL DEFAULT '',
                auth_type TEXT NOT NULL DEFAULT 'none',
                auth_data TEXT NOT NULL DEFAULT '{}',
                default_environment_id TEXT REFERENCES api_environments(id) ON DELETE SET NULL,
                sort_order INTEGER NOT NULL DEFAULT 0,
                deleted_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_requests_collection ON api_requests(collection_id, sort_order);
            CREATE INDEX IF NOT EXISTS idx_api_requests_folder ON api_requests(folder_id, sort_order);
            CREATE INDEX IF NOT EXISTS idx_api_requests_workspace ON api_requests(workspace_id);

            -- ─── Request Executions (History) ────────────────────────
            CREATE TABLE IF NOT EXISTS api_request_executions (
                id TEXT PRIMARY KEY,
                request_id TEXT REFERENCES api_requests(id) ON DELETE SET NULL,
                environment_id TEXT REFERENCES api_environments(id) ON DELETE SET NULL,
                workspace_id TEXT NOT NULL DEFAULT 'default',
                name TEXT NOT NULL DEFAULT '',
                method TEXT NOT NULL,
                url TEXT NOT NULL,
                resolved_url TEXT NOT NULL DEFAULT '',
                headers_snapshot TEXT NOT NULL DEFAULT '{}',
                body_snapshot TEXT NOT NULL DEFAULT '',
                auth_snapshot TEXT NOT NULL DEFAULT '{}',
                status TEXT NOT NULL DEFAULT 'success',
                error_message TEXT,
                duration_ms INTEGER NOT NULL DEFAULT 0,
                executed_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_executions_request ON api_request_executions(request_id, executed_at DESC);
            CREATE INDEX IF NOT EXISTS idx_api_executions_workspace ON api_request_executions(workspace_id, executed_at DESC);
            CREATE INDEX IF NOT EXISTS idx_api_executions_env ON api_request_executions(environment_id, executed_at DESC);
            CREATE INDEX IF NOT EXISTS idx_api_executions_method ON api_request_executions(method, executed_at DESC);
            CREATE INDEX IF NOT EXISTS idx_api_executions_status ON api_request_executions(status, executed_at DESC);

            -- ─── Execution Responses ─────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_execution_responses (
                id TEXT PRIMARY KEY,
                execution_id TEXT NOT NULL REFERENCES api_request_executions(id) ON DELETE CASCADE,
                status_code INTEGER NOT NULL,
                status_text TEXT NOT NULL DEFAULT '',
                headers TEXT NOT NULL DEFAULT '{}',
                body TEXT NOT NULL DEFAULT '',
                body_storage_type TEXT NOT NULL DEFAULT 'inline',
                blob_path TEXT,
                size_bytes INTEGER NOT NULL DEFAULT 0,
                timing_total_ms INTEGER NOT NULL DEFAULT 0,
                timing_dns_ms INTEGER,
                timing_connect_ms INTEGER,
                timing_tls_ms INTEGER,
                timing_ttfb_ms INTEGER,
                timing_download_ms INTEGER,
                received_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_exec_responses_exec ON api_execution_responses(execution_id);

            -- ─── Cookie Jars ─────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_cookie_jars (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL DEFAULT 'default' REFERENCES workspaces(id) ON DELETE CASCADE,
                environment_id TEXT REFERENCES api_environments(id) ON DELETE CASCADE,
                name TEXT NOT NULL DEFAULT 'Default',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(workspace_id, environment_id)
            );
            CREATE INDEX IF NOT EXISTS idx_api_cookie_jars_workspace ON api_cookie_jars(workspace_id);

            -- ─── Cookies ─────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_cookies (
                id TEXT PRIMARY KEY,
                jar_id TEXT NOT NULL REFERENCES api_cookie_jars(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                value TEXT NOT NULL DEFAULT '',
                domain TEXT NOT NULL,
                path TEXT NOT NULL DEFAULT '/',
                secure INTEGER NOT NULL DEFAULT 0,
                http_only INTEGER NOT NULL DEFAULT 0,
                same_site TEXT NOT NULL DEFAULT 'Lax',
                expires_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_cookies_jar ON api_cookies(jar_id);
            CREATE INDEX IF NOT EXISTS idx_api_cookies_domain ON api_cookies(jar_id, domain, path);

            -- ─── Response Snapshots ──────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_response_snapshots (
                id TEXT PRIMARY KEY,
                execution_id TEXT NOT NULL REFERENCES api_request_executions(id) ON DELETE CASCADE,
                request_id TEXT REFERENCES api_requests(id) ON DELETE SET NULL,
                label TEXT NOT NULL DEFAULT '',
                snapshot_type TEXT NOT NULL DEFAULT 'manual',
                status_code INTEGER NOT NULL,
                status_text TEXT NOT NULL DEFAULT '',
                headers TEXT NOT NULL DEFAULT '{}',
                body TEXT NOT NULL DEFAULT '',
                size_bytes INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_snapshots_exec ON api_response_snapshots(execution_id);
            CREATE INDEX IF NOT EXISTS idx_api_snapshots_request ON api_response_snapshots(request_id);

            -- ─── Response Diffs ──────────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_response_diffs (
                id TEXT PRIMARY KEY,
                snapshot_a_id TEXT NOT NULL REFERENCES api_response_snapshots(id) ON DELETE CASCADE,
                snapshot_b_id TEXT NOT NULL REFERENCES api_response_snapshots(id) ON DELETE CASCADE,
                diff_type TEXT NOT NULL DEFAULT 'body',
                diff_content TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_diffs_snapshots ON api_response_diffs(snapshot_a_id, snapshot_b_id);

            -- ─── Saved Examples / Mocks ──────────────────────────────
            CREATE TABLE IF NOT EXISTS api_saved_examples (
                id TEXT PRIMARY KEY,
                request_id TEXT REFERENCES api_requests(id) ON DELETE SET NULL,
                execution_id TEXT REFERENCES api_request_executions(id) ON DELETE SET NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                status_code INTEGER NOT NULL,
                headers TEXT NOT NULL DEFAULT '{}',
                body TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_examples_request ON api_saved_examples(request_id);

            -- ─── Runners (Collection Sequencer) ─────────────────────
            CREATE TABLE IF NOT EXISTS api_runners (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL DEFAULT 'default' REFERENCES workspaces(id) ON DELETE CASCADE,
                collection_id TEXT REFERENCES api_collections(id) ON DELETE SET NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_runners_workspace ON api_runners(workspace_id, sort_order);

            -- ─── Runner Steps ────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_runner_steps (
                id TEXT PRIMARY KEY,
                runner_id TEXT NOT NULL REFERENCES api_runners(id) ON DELETE CASCADE,
                request_id TEXT NOT NULL REFERENCES api_requests(id) ON DELETE CASCADE,
                step_number INTEGER NOT NULL,
                variable_extractions TEXT NOT NULL DEFAULT '[]',
                pre_script TEXT NOT NULL DEFAULT '',
                post_script TEXT NOT NULL DEFAULT '',
                delay_ms INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_runner_steps_runner ON api_runner_steps(runner_id, step_number);

            -- ─── Runner Runs ─────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_runner_runs (
                id TEXT PRIMARY KEY,
                runner_id TEXT NOT NULL REFERENCES api_runners(id) ON DELETE CASCADE,
                environment_id TEXT REFERENCES api_environments(id) ON DELETE SET NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                started_at TEXT,
                completed_at TEXT,
                iteration_data TEXT NOT NULL DEFAULT '',
                total_steps INTEGER NOT NULL DEFAULT 0,
                passed_steps INTEGER NOT NULL DEFAULT 0,
                failed_steps INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_runner_runs_runner ON api_runner_runs(runner_id, created_at DESC);

            -- ─── Runner Step Runs ────────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_runner_step_runs (
                id TEXT PRIMARY KEY,
                runner_run_id TEXT NOT NULL REFERENCES api_runner_runs(id) ON DELETE CASCADE,
                step_id TEXT NOT NULL REFERENCES api_runner_steps(id) ON DELETE CASCADE,
                request_id TEXT NOT NULL,
                execution_id TEXT REFERENCES api_request_executions(id) ON DELETE SET NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                error_message TEXT,
                captured_variables TEXT NOT NULL DEFAULT '{}',
                step_number INTEGER NOT NULL,
                started_at TEXT,
                completed_at TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_api_step_runs_run ON api_runner_step_runs(runner_run_id, step_number);

            -- ─── Captured Variables ──────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_captured_variables (
                id TEXT PRIMARY KEY,
                runner_run_id TEXT NOT NULL REFERENCES api_runner_runs(id) ON DELETE CASCADE,
                step_run_id TEXT REFERENCES api_runner_step_runs(id) ON DELETE SET NULL,
                variable_name TEXT NOT NULL,
                value TEXT NOT NULL DEFAULT '',
                source_path TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_captured_vars_run ON api_captured_variables(runner_run_id);

            -- ─── GraphQL Requests ────────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_graphql_requests (
                id TEXT PRIMARY KEY,
                request_id TEXT NOT NULL REFERENCES api_requests(id) ON DELETE CASCADE,
                query TEXT NOT NULL DEFAULT '',
                variables TEXT NOT NULL DEFAULT '{}',
                operation_name TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_graphql_request ON api_graphql_requests(request_id);

            -- ─── WebSocket Connections ───────────────────────────────
            CREATE TABLE IF NOT EXISTS api_ws_connections (
                id TEXT PRIMARY KEY,
                request_id TEXT REFERENCES api_requests(id) ON DELETE SET NULL,
                environment_id TEXT REFERENCES api_environments(id) ON DELETE SET NULL,
                url TEXT NOT NULL,
                protocols TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'disconnected',
                connected_at TEXT,
                disconnected_at TEXT,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_ws_conn_request ON api_ws_connections(request_id);

            -- ─── WebSocket Messages ──────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_ws_messages (
                id TEXT PRIMARY KEY,
                connection_id TEXT NOT NULL REFERENCES api_ws_connections(id) ON DELETE CASCADE,
                direction TEXT NOT NULL DEFAULT 'outbound',
                message_type TEXT NOT NULL DEFAULT 'text',
                payload TEXT NOT NULL DEFAULT '',
                timestamp TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_ws_msgs_conn ON api_ws_messages(connection_id, timestamp DESC);

            -- ─── Endpoint Documentation ──────────────────────────────
            CREATE TABLE IF NOT EXISTS api_endpoint_docs (
                id TEXT PRIMARY KEY,
                request_id TEXT NOT NULL REFERENCES api_requests(id) ON DELETE CASCADE,
                title TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                content TEXT NOT NULL DEFAULT '',
                auto_generated INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_docs_request ON api_endpoint_docs(request_id);

            -- ─── AI Artifacts ────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_ai_artifacts (
                id TEXT PRIMARY KEY,
                request_id TEXT REFERENCES api_requests(id) ON DELETE SET NULL,
                execution_id TEXT REFERENCES api_request_executions(id) ON DELETE SET NULL,
                artifact_type TEXT NOT NULL,
                name TEXT NOT NULL DEFAULT '',
                content TEXT NOT NULL DEFAULT '',
                language TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_ai_artifacts_request ON api_ai_artifacts(request_id);

            -- ─── Audit Events ────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_audit_events (
                id TEXT PRIMARY KEY,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                action TEXT NOT NULL,
                changed_fields TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_api_audit_entity ON api_audit_events(entity_type, entity_id, created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_api_audit_created ON api_audit_events(created_at DESC);

            -- ─── AI Assistant Sessions ────────────────────────────────
            CREATE TABLE IF NOT EXISTS ai_assistant_sessions (
                id TEXT PRIMARY KEY,
                app_id TEXT NOT NULL,
                scope_key TEXT,
                conversation_id TEXT NOT NULL,
                title TEXT NOT NULL DEFAULT 'Chat',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_ai_sessions_app ON ai_assistant_sessions(app_id, updated_at DESC);
            -- Note: idx_ai_sessions_app_scope is created below, AFTER the
            -- ALTER TABLE migration that adds `scope_key` for pre-existing DBs.

            -- ─── Notes ────────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                app_id TEXT NOT NULL,
                scope_type TEXT NOT NULL,
                scope_id TEXT NOT NULL,
                title TEXT NOT NULL DEFAULT '',
                content TEXT NOT NULL DEFAULT '',
                is_pinned INTEGER NOT NULL DEFAULT 0,
                color TEXT,
                emoji TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_notes_scope ON notes(app_id, scope_type, scope_id, updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_notes_app ON notes(app_id, updated_at DESC);

            -- ─── Note Versions ────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS note_versions (
                id TEXT PRIMARY KEY,
                note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_note_versions_note ON note_versions(note_id, created_at DESC);

            -- ─── Note Highlights ──────────────────────────────────────
            CREATE TABLE IF NOT EXISTS note_highlights (
                id TEXT PRIMARY KEY,
                note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
                text TEXT NOT NULL DEFAULT '',
                from_pos INTEGER NOT NULL DEFAULT 0,
                to_pos INTEGER NOT NULL DEFAULT 0,
                note TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_note_highlights_note ON note_highlights(note_id, created_at DESC);

            -- ─── Note Projects ──────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS note_projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                color TEXT,
                icon TEXT,
                emoji TEXT,
                is_system INTEGER NOT NULL DEFAULT 0,
                is_favorite INTEGER NOT NULL DEFAULT 0,
                sort_order INTEGER NOT NULL DEFAULT 0,
                sort_preference TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_note_projects_order ON note_projects(sort_order);

            -- ─── Note Notebooks ─────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS note_notebooks (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                color TEXT,
                icon TEXT,
                emoji TEXT,
                is_system INTEGER NOT NULL DEFAULT 0,
                sort_order INTEGER NOT NULL DEFAULT 0,
                project_id TEXT REFERENCES note_projects(id) ON DELETE CASCADE,
                sort_preference TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_note_notebooks_order ON note_notebooks(sort_order);
            -- Note: idx_note_notebooks_project is created below, AFTER the
            -- ALTER TABLE migration runs that adds `project_id` for DBs
            -- created prior to this column. Creating it here would fail on
            -- pre-existing databases because CREATE TABLE IF NOT EXISTS is a
            -- no-op when the table already exists.

            -- ─── Note Sections ──────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS note_sections (
                id TEXT PRIMARY KEY,
                notebook_id TEXT NOT NULL REFERENCES note_notebooks(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                color TEXT,
                icon TEXT,
                emoji TEXT,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_note_sections_notebook ON note_sections(notebook_id, sort_order);

            -- ─── Note Topics ────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS note_topics (
                id TEXT PRIMARY KEY,
                section_id TEXT NOT NULL REFERENCES note_sections(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                color TEXT,
                icon TEXT,
                emoji TEXT,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_note_topics_section ON note_topics(section_id, sort_order);

            -- ─── Note Labels ────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS note_labels (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                color TEXT,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_note_labels_name ON note_labels(name);

            -- ─── Note ↔ Label Junction ──────────────────────────────────
            CREATE TABLE IF NOT EXISTS note_label_map (
                note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
                label_id TEXT NOT NULL REFERENCES note_labels(id) ON DELETE CASCADE,
                PRIMARY KEY (note_id, label_id)
            );
            CREATE INDEX IF NOT EXISTS idx_note_label_map_note ON note_label_map(note_id);
            CREATE INDEX IF NOT EXISTS idx_note_label_map_label ON note_label_map(label_id);
            ",
        )
        .map_err(|e| format!("Failed to create tables: {e}"))?;

        // Ensure snippets columns exist (safe for fresh + existing DBs)
        let snippet_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('snippets')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !snippet_cols.contains(&"conversation_id".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE snippets ADD COLUMN conversation_id TEXT");
        }
        if !snippet_cols.contains(&"is_favorite".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE snippets ADD COLUMN is_favorite INTEGER NOT NULL DEFAULT 0");
        }
        let _ = conn.execute_batch(
            "CREATE INDEX IF NOT EXISTS idx_snippets_updated ON snippets(updated_at DESC);
             CREATE INDEX IF NOT EXISTS idx_snippets_favorite ON snippets(is_favorite);",
        );

        // ─── Daily Plan reviews: PR author + avatar (migration for existing DBs) ──
        let dp_review_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('dp_reviews')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !dp_review_cols.contains(&"author_name".to_string()) {
            let _ = conn.execute_batch(
                "ALTER TABLE dp_reviews ADD COLUMN author_name TEXT NOT NULL DEFAULT ''",
            );
        }
        if !dp_review_cols.contains(&"author_avatar_url".to_string()) {
            let _ = conn.execute_batch(
                "ALTER TABLE dp_reviews ADD COLUMN author_avatar_url TEXT NOT NULL DEFAULT ''",
            );
        }

        // Ensure chapters.is_read exists (migration for existing DBs)
        let chapter_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('chapters')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !chapter_cols.contains(&"is_read".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE chapters ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0");
        }
        if !chapter_cols.contains(&"language".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE chapters ADD COLUMN language TEXT NOT NULL DEFAULT 'english'");
        }
        if !chapter_cols.contains(&"generation_duration_ms".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE chapters ADD COLUMN generation_duration_ms INTEGER");
        }

        // Ensure pm_folders.scopes_json exists (migration for existing DBs)
        let pm_folder_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('pm_folders')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !pm_folder_cols.contains(&"scopes_json".to_string()) {
            let _ = conn.execute_batch(
                "ALTER TABLE pm_folders ADD COLUMN scopes_json TEXT NOT NULL DEFAULT '[]'",
            );
        }

        // Ensure pm_prompts.app_scopes exists (migration for existing DBs)
        let pm_prompt_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('pm_prompts')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !pm_prompt_cols.contains(&"app_scopes".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE pm_prompts ADD COLUMN app_scopes TEXT");
        }

        // Ensure chapter_translations table exists (migration for existing DBs)
        let _ = conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS chapter_translations (
                id TEXT PRIMARY KEY,
                chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
                language TEXT NOT NULL,
                content TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
             CREATE UNIQUE INDEX IF NOT EXISTS idx_chapter_translations_unique ON chapter_translations(chapter_id, language);
             CREATE INDEX IF NOT EXISTS idx_chapter_translations_chapter ON chapter_translations(chapter_id);",
        );

        // Ensure books.model exists (migration for existing DBs)
        let book_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('books')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !book_cols.contains(&"model".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE books ADD COLUMN model TEXT NOT NULL DEFAULT ''");
        }
        if !book_cols.contains(&"language".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE books ADD COLUMN language TEXT NOT NULL DEFAULT 'english'");
        }
        if !book_cols.contains(&"generation_duration_ms".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE books ADD COLUMN generation_duration_ms INTEGER");
        }

        // Ensure conversations.message_count exists (migration for existing DBs)
        let conv_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('conversations')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !conv_cols.contains(&"message_count".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE conversations ADD COLUMN message_count INTEGER NOT NULL DEFAULT 0");
            // Backfill message_count from existing data
            let _ = conn.execute_batch(
                "UPDATE conversations SET message_count = (
                    SELECT COUNT(*) FROM chat_messages WHERE chat_messages.conversation_id = conversations.id
                )"
            );
        }

        // Ensure chat_messages.reasoning + activities_json exist (migration for existing DBs)
        let chat_msg_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('chat_messages')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !chat_msg_cols.contains(&"reasoning".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE chat_messages ADD COLUMN reasoning TEXT");
        }
        if !chat_msg_cols.contains(&"activities_json".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE chat_messages ADD COLUMN activities_json TEXT");
        }
        if !chat_msg_cols.contains(&"context_mode".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE chat_messages ADD COLUMN context_mode INTEGER");
        }
        if !chat_msg_cols.contains(&"images".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE chat_messages ADD COLUMN images TEXT");
        }

        // Ensure ai_assistant_sessions.scope_key exists (migration for existing
        // DBs), then create the composite index now that the column is present.
        let ai_session_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('ai_assistant_sessions')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !ai_session_cols.contains(&"scope_key".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE ai_assistant_sessions ADD COLUMN scope_key TEXT");
        }
        let _ = conn.execute_batch(
            "CREATE INDEX IF NOT EXISTS idx_ai_sessions_app_scope ON ai_assistant_sessions(app_id, scope_key, updated_at DESC)",
        );

        // ─── DeepResearch removal: drop legacy tables left over on older DBs ──
        // The DeepResearch app was removed; these tables are no longer referenced
        // anywhere in the codebase. `research_sources` is intentionally kept
        // because Chat reuses it to persist attached sources.
        let _ = conn.execute_batch(
            "DROP TABLE IF EXISTS research_message_annotations;
             DROP TABLE IF EXISTS research_messages;
             DROP TABLE IF EXISTS research_sessions;",
        );

        // Ensure annotation tables exist (migration for existing DBs that pre-date them).
        let _ = conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS chat_message_annotations (
                id TEXT PRIMARY KEY,
                message_id TEXT NOT NULL UNIQUE REFERENCES chat_messages(id) ON DELETE CASCADE,
                task_summary TEXT NOT NULL DEFAULT '',
                chosen_option TEXT NOT NULL DEFAULT '',
                reasoning TEXT NOT NULL DEFAULT '',
                alternatives TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_chat_message_annotations_message ON chat_message_annotations(message_id);"
        );

        // ─── Notes App: new columns (migration for existing DBs) ──────
        let note_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('notes')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !note_cols.contains(&"notebook_id".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE notes ADD COLUMN notebook_id TEXT REFERENCES note_notebooks(id) ON DELETE SET NULL");
        }
        if !note_cols.contains(&"section_id".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE notes ADD COLUMN section_id TEXT REFERENCES note_sections(id) ON DELETE SET NULL");
        }
        if !note_cols.contains(&"topic_id".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE notes ADD COLUMN topic_id TEXT REFERENCES note_topics(id) ON DELETE SET NULL");
        }
        if !note_cols.contains(&"source".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE notes ADD COLUMN source TEXT");
        }
        if !note_cols.contains(&"sort_order".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE notes ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0");
        }
        if !note_cols.contains(&"color".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE notes ADD COLUMN color TEXT");
        }
        if !note_cols.contains(&"emoji".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE notes ADD COLUMN emoji TEXT");
        }

        // ─── Notebooks / Sections / Topics: emoji column ──────────────
        let notebook_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('note_notebooks')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !notebook_cols.contains(&"emoji".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE note_notebooks ADD COLUMN emoji TEXT");
        }
        if !notebook_cols.contains(&"project_id".to_string()) {
            let _ = conn.execute_batch(
                "ALTER TABLE note_notebooks ADD COLUMN project_id TEXT REFERENCES note_projects(id) ON DELETE CASCADE",
            );
        }
        if !notebook_cols.contains(&"sort_preference".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE note_notebooks ADD COLUMN sort_preference TEXT");
        }
        // Ensure the project_id index exists for both fresh and migrated DBs.
        let _ = conn.execute_batch(
            "CREATE INDEX IF NOT EXISTS idx_note_notebooks_project ON note_notebooks(project_id)",
        );
        // ─── Projects: sort_preference column ─────────────────────────
        let project_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('note_projects')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !project_cols.contains(&"sort_preference".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE note_projects ADD COLUMN sort_preference TEXT");
        }
        let section_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('note_sections')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !section_cols.contains(&"emoji".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE note_sections ADD COLUMN emoji TEXT");
        }
        let topic_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('note_topics')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !topic_cols.contains(&"emoji".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE note_topics ADD COLUMN emoji TEXT");
        }

        // ─── Notes: favorite / trash columns ──────────────────────────
        if !note_cols.contains(&"is_favorite".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE notes ADD COLUMN is_favorite INTEGER NOT NULL DEFAULT 0");
        }
        if !note_cols.contains(&"is_trashed".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE notes ADD COLUMN is_trashed INTEGER NOT NULL DEFAULT 0");
        }
        if !note_cols.contains(&"trashed_at".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE notes ADD COLUMN trashed_at TEXT");
        }

        // Ensure QuickNote system notebook exists
        let _ = conn.execute(
            "INSERT OR IGNORE INTO note_notebooks (id, name, color, icon, is_system, sort_order, created_at, updated_at)
             VALUES ('quicknote', 'QuickNote', '#3b82f6', 'Zap', 1, 0, datetime('now'), datetime('now'))",
            [],
        );

        // Ensure default 'Personal' system project exists
        let _ = conn.execute(
            "INSERT OR IGNORE INTO note_projects (id, name, color, icon, is_system, is_favorite, sort_order, created_at, updated_at)
             VALUES ('personal', 'Personal', '#6366f1', 'FolderOpen', 1, 0, 0, datetime('now'), datetime('now'))",
            [],
        );

        // Migrate notebooks that have no project assignment into the Personal project
        let _ = conn.execute(
            "UPDATE note_notebooks SET project_id = 'personal' WHERE project_id IS NULL",
            [],
        );

        // Seed built-in commands (idempotent — INSERT OR IGNORE)
        let _ = conn.execute_batch(
            "INSERT OR IGNORE INTO commands (id, name, description, tool_name, args_template, is_built_in, sort_order, created_at, updated_at) VALUES
             ('builtin-url',    'url',    'Crawl and analyze a webpage',         'crawl_webpage', '{\"url\": \"\"}',     1, 0, datetime('now'), datetime('now')),
             ('builtin-repo',   'repo',   'Attach a local repository for context','attach_repo',  '{\"path\": \"\"}',    1, 1, datetime('now'), datetime('now')),
             ('builtin-file',   'file',   'Read file contents',                  'read_file',     '{\"path\": \"\"}',    1, 2, datetime('now'), datetime('now')),
             ('builtin-search', 'search', 'Search for patterns in code',         'grep_search',   '{\"pattern\": \"\"}', 1, 3, datetime('now'), datetime('now'));",
        );

        // Seed default workspace (idempotent)
        let _ = conn.execute_batch(
            "INSERT OR IGNORE INTO workspaces (id, name, description, is_default, created_at, updated_at)
             VALUES ('default', 'Personal', 'Default workspace', 1, datetime('now'), datetime('now'));",
        );

        // ─── Mock Server Tables ────────────────────────────────────
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS mock_projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                color TEXT NOT NULL DEFAULT '#6366f1',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS mock_servers (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                name TEXT NOT NULL,
                port INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (project_id) REFERENCES mock_projects(id)
            );
            CREATE INDEX IF NOT EXISTS idx_mock_servers_project ON mock_servers(project_id);

            CREATE TABLE IF NOT EXISTS mock_endpoints (
                id TEXT PRIMARY KEY,
                server_id TEXT NOT NULL,
                method TEXT NOT NULL DEFAULT 'GET',
                path TEXT NOT NULL DEFAULT '/',
                status_code INTEGER NOT NULL DEFAULT 200,
                response_headers TEXT NOT NULL DEFAULT '{}',
                response_body TEXT NOT NULL DEFAULT '',
                response_type TEXT NOT NULL DEFAULT 'static',
                ai_prompt TEXT NOT NULL DEFAULT '',
                ai_schema TEXT NOT NULL DEFAULT '',
                ai_count INTEGER NOT NULL DEFAULT 1,
                delay_ms INTEGER NOT NULL DEFAULT 0,
                description TEXT NOT NULL DEFAULT '',
                is_active INTEGER NOT NULL DEFAULT 1,
                variant_mode TEXT NOT NULL DEFAULT 'single',
                ai_mode TEXT NOT NULL DEFAULT 'live',
                ai_cache_ttl_ms INTEGER NOT NULL DEFAULT 60000,
                ai_pool_size INTEGER NOT NULL DEFAULT 5,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (server_id) REFERENCES mock_servers(id)
            );
            CREATE INDEX IF NOT EXISTS idx_mock_endpoints_server ON mock_endpoints(server_id);

            CREATE TABLE IF NOT EXISTS mock_endpoint_variants (
                id TEXT PRIMARY KEY,
                endpoint_id TEXT NOT NULL,
                name TEXT NOT NULL DEFAULT '',
                status_code INTEGER NOT NULL DEFAULT 200,
                response_headers TEXT NOT NULL DEFAULT '{}',
                response_body TEXT NOT NULL DEFAULT '',
                match_rules TEXT NOT NULL DEFAULT '[]',
                weight INTEGER NOT NULL DEFAULT 1,
                order_index INTEGER NOT NULL DEFAULT 0,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (endpoint_id) REFERENCES mock_endpoints(id)
            );
            CREATE INDEX IF NOT EXISTS idx_mock_variants_endpoint ON mock_endpoint_variants(endpoint_id);

            CREATE TABLE IF NOT EXISTS mock_request_logs (
                id               TEXT PRIMARY KEY,
                server_id        TEXT NOT NULL,
                method           TEXT NOT NULL,
                path             TEXT NOT NULL,
                status           INTEGER NOT NULL,
                timestamp        TEXT NOT NULL,
                duration_ms      INTEGER NOT NULL DEFAULT 0,
                request_headers  TEXT NOT NULL DEFAULT '{}',
                request_body     TEXT NOT NULL DEFAULT '',
                query_string     TEXT NOT NULL DEFAULT '',
                response_headers TEXT NOT NULL DEFAULT '{}',
                response_body    TEXT NOT NULL DEFAULT ''
            );
            CREATE INDEX IF NOT EXISTS idx_mock_logs_server ON mock_request_logs(server_id);
            CREATE INDEX IF NOT EXISTS idx_mock_logs_ts ON mock_request_logs(timestamp);
            ",
        )
        .map_err(|e| format!("Failed to create mock server tables: {e}"))?;

        // Ensure mock_endpoints.variant_mode exists (migration for existing DBs)
        let mock_endpoint_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('mock_endpoints')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !mock_endpoint_cols.contains(&"variant_mode".to_string()) {
            let _ = conn.execute_batch(
                "ALTER TABLE mock_endpoints ADD COLUMN variant_mode TEXT NOT NULL DEFAULT 'single'",
            );
        }
        // Dynamic AI response columns (migration for existing DBs).
        if !mock_endpoint_cols.contains(&"ai_mode".to_string()) {
            let _ = conn.execute_batch(
                "ALTER TABLE mock_endpoints ADD COLUMN ai_mode TEXT NOT NULL DEFAULT 'live'",
            );
        }
        if !mock_endpoint_cols.contains(&"ai_cache_ttl_ms".to_string()) {
            let _ = conn.execute_batch(
                "ALTER TABLE mock_endpoints ADD COLUMN ai_cache_ttl_ms INTEGER NOT NULL DEFAULT 60000",
            );
        }
        if !mock_endpoint_cols.contains(&"ai_pool_size".to_string()) {
            let _ = conn.execute_batch(
                "ALTER TABLE mock_endpoints ADD COLUMN ai_pool_size INTEGER NOT NULL DEFAULT 5",
            );
        }

        // Seed default "Uncategorized" mock project
        let _ = conn.execute(
            "INSERT OR IGNORE INTO mock_projects (id, name, color, created_at, updated_at) \
             VALUES ('uncategorized', 'Uncategorized', '#6b7280', datetime('now'), datetime('now'))",
            [],
        );

        // ── Daily Plan tables ──────────────────────────────────────────
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS dp_tasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'todo',
                priority TEXT NOT NULL DEFAULT 'medium',
                category_id TEXT,
                scheduled_date TEXT NOT NULL,
                scheduled_time TEXT,
                duration_minutes INTEGER NOT NULL DEFAULT 30,
                reminder_at TEXT,
                sort_order INTEGER NOT NULL DEFAULT 0,
                completed_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_dp_tasks_date ON dp_tasks(scheduled_date, sort_order);
            CREATE INDEX IF NOT EXISTS idx_dp_tasks_status ON dp_tasks(status, scheduled_date);

            CREATE TABLE IF NOT EXISTS dp_reviews (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'todo',
                priority TEXT NOT NULL DEFAULT 'medium',
                review_type TEXT NOT NULL DEFAULT 'general',
                link TEXT NOT NULL DEFAULT '',
                author_name TEXT NOT NULL DEFAULT '',
                author_avatar_url TEXT NOT NULL DEFAULT '',
                scheduled_date TEXT NOT NULL,
                scheduled_time TEXT,
                duration_minutes INTEGER NOT NULL DEFAULT 30,
                reminder_at TEXT,
                sort_order INTEGER NOT NULL DEFAULT 0,
                completed_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_dp_reviews_date ON dp_reviews(scheduled_date, sort_order);
            CREATE INDEX IF NOT EXISTS idx_dp_reviews_status ON dp_reviews(status, scheduled_date);

            CREATE TABLE IF NOT EXISTS dp_meetings (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                scheduled_date TEXT NOT NULL,
                start_time TEXT NOT NULL DEFAULT '09:00',
                end_time TEXT NOT NULL DEFAULT '10:00',
                location TEXT NOT NULL DEFAULT '',
                meeting_link TEXT NOT NULL DEFAULT '',
                reminder_at TEXT,
                status TEXT NOT NULL DEFAULT 'scheduled',
                meeting_type TEXT NOT NULL DEFAULT 'general',
                priority TEXT NOT NULL DEFAULT 'medium',
                notes TEXT NOT NULL DEFAULT '',
                follow_up TEXT NOT NULL DEFAULT '',
                agenda TEXT NOT NULL DEFAULT '',
                outcome TEXT NOT NULL DEFAULT '',
                attendees TEXT NOT NULL DEFAULT '',
                cancel_reason TEXT NOT NULL DEFAULT '',
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_dp_meetings_date ON dp_meetings(scheduled_date, start_time);

            CREATE TABLE IF NOT EXISTS dp_daily_entries (
                id TEXT PRIMARY KEY,
                date TEXT NOT NULL UNIQUE,
                motivational_quote TEXT NOT NULL DEFAULT '',
                status_content TEXT NOT NULL DEFAULT '',
                yesterday_review TEXT NOT NULL DEFAULT '',
                work_start_time TEXT DEFAULT NULL,
                work_end_time TEXT DEFAULT NULL,
                lunch_start_time TEXT DEFAULT NULL,
                lunch_end_time TEXT DEFAULT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_dp_daily_entries_date ON dp_daily_entries(date);

            CREATE TABLE IF NOT EXISTS dp_categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL DEFAULT '',
                color TEXT NOT NULL DEFAULT '#6366f1',
                icon TEXT NOT NULL DEFAULT '',
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS dp_templates (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                template_type TEXT NOT NULL DEFAULT 'custom',
                content TEXT NOT NULL DEFAULT '{}',
                is_built_in INTEGER NOT NULL DEFAULT 0,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS dp_daily_status (
                date TEXT PRIMARY KEY,
                content TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            ",
        )
        .map_err(|e| format!("Failed to create daily plan tables: {e}"))?;

        // ── Saved Webpages table ──────────────────────────────────────
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS saved_webpages (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_size INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_saved_webpages_created ON saved_webpages(created_at DESC);
            ",
        )
        .map_err(|e| format!("Failed to create saved_webpages table: {e}"))?;

        // ── Clipboard Items table ─────────────────────────────────────
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS clipboard_items (
                id TEXT PRIMARY KEY,
                content_type TEXT NOT NULL,
                text_content TEXT,
                image_path TEXT,
                thumbnail_path TEXT,
                is_pinned INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                content_hash TEXT NOT NULL,
                byte_size INTEGER NOT NULL DEFAULT 0,
                image_description TEXT,
                analysis_status TEXT NOT NULL DEFAULT 'none'
            );
            CREATE INDEX IF NOT EXISTS idx_clipboard_items_sort ON clipboard_items(is_pinned DESC, created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_clipboard_items_hash ON clipboard_items(content_hash);
            CREATE INDEX IF NOT EXISTS idx_clipboard_items_type ON clipboard_items(content_type);
            CREATE INDEX IF NOT EXISTS idx_clipboard_items_created ON clipboard_items(created_at DESC);
            ",
        )
        .map_err(|e| format!("Failed to create clipboard_items table: {e}"))?;

        // ── Clipboard Labels table ────────────────────────────────────
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS clipboard_labels (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                color TEXT NOT NULL DEFAULT '#6b7280',
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS clipboard_item_labels (
                item_id TEXT NOT NULL,
                label_id TEXT NOT NULL,
                PRIMARY KEY (item_id, label_id),
                FOREIGN KEY (item_id) REFERENCES clipboard_items(id) ON DELETE CASCADE,
                FOREIGN KEY (label_id) REFERENCES clipboard_labels(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_clipboard_item_labels_item ON clipboard_item_labels(item_id);
            CREATE INDEX IF NOT EXISTS idx_clipboard_item_labels_label ON clipboard_item_labels(label_id);
            ",
        )
        .map_err(|e| format!("Failed to create clipboard_labels tables: {e}"))?;

        // ── Clipboard FTS5 virtual table ────────────────────────────────
        conn.execute_batch(
            "CREATE VIRTUAL TABLE IF NOT EXISTS clipboard_fts USING fts5(
                item_id UNINDEXED,
                text_content,
                image_description,
                tokenize='unicode61'
            );

            CREATE TRIGGER IF NOT EXISTS clipboard_fts_insert AFTER INSERT ON clipboard_items
            BEGIN
                INSERT INTO clipboard_fts(item_id, text_content, image_description)
                VALUES (NEW.id, COALESCE(NEW.text_content, ''), COALESCE(NEW.image_description, ''));
            END;

            CREATE TRIGGER IF NOT EXISTS clipboard_fts_update AFTER UPDATE OF text_content, image_description ON clipboard_items
            BEGIN
                UPDATE clipboard_fts SET text_content = COALESCE(NEW.text_content, ''), image_description = COALESCE(NEW.image_description, '')
                WHERE item_id = NEW.id;
            END;

            CREATE TRIGGER IF NOT EXISTS clipboard_fts_delete AFTER DELETE ON clipboard_items
            BEGIN
                DELETE FROM clipboard_fts WHERE item_id = OLD.id;
            END;
            ",
        )
        .map_err(|e| format!("Failed to create clipboard FTS5 table: {e}"))?;

        // Migrate research_sources to drop FK constraint (allows sources on chat conversations,
        // which is the only remaining surface that writes to this table after DeepResearch removal).
        // Check if FK exists by trying to query the foreign_key_list pragma
        let has_fk: bool = conn
            .prepare("PRAGMA foreign_key_list('research_sources')")
            .and_then(|mut stmt| {
                stmt.query_map([], |_row| Ok(true))
                    .map(|rows| rows.filter_map(|r| r.ok()).next().unwrap_or(false))
            })
            .unwrap_or(false);
        if has_fk {
            let _ = conn.execute_batch(
                "PRAGMA foreign_keys = OFF;
                 BEGIN IMMEDIATE;
                 CREATE TABLE research_sources_new (
                     id TEXT PRIMARY KEY,
                     session_id TEXT NOT NULL,
                     source_type TEXT NOT NULL,
                     path TEXT,
                     name TEXT NOT NULL,
                     created_at TEXT NOT NULL
                 );
                 INSERT INTO research_sources_new SELECT * FROM research_sources;
                 DROP TABLE research_sources;
                 ALTER TABLE research_sources_new RENAME TO research_sources;
                 CREATE INDEX IF NOT EXISTS idx_research_sources_session ON research_sources(session_id);
                 COMMIT;
                 PRAGMA foreign_keys = ON;",
            );
        }

        // ─── Clipboard Items: extracted_text column ──────────────
        let clip_cols: Vec<String> = conn
            .prepare("PRAGMA table_info('clipboard_items')")
            .and_then(|mut stmt| {
                stmt.query_map([], |row| row.get::<_, String>(1))
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default();
        if !clip_cols.contains(&"extracted_text".to_string()) {
            let _ = conn.execute_batch("ALTER TABLE clipboard_items ADD COLUMN extracted_text TEXT");
        }
        if !clip_cols.contains(&"smart_categories".to_string()) {
            let _ =
                conn.execute_batch("ALTER TABLE clipboard_items ADD COLUMN smart_categories TEXT");
        }
        if !clip_cols.contains(&"sensitivity_level".to_string()) {
            let _ =
                conn.execute_batch("ALTER TABLE clipboard_items ADD COLUMN sensitivity_level TEXT");
        }
        if !clip_cols.contains(&"sensitivity_matches".to_string()) {
            let _ = conn
                .execute_batch("ALTER TABLE clipboard_items ADD COLUMN sensitivity_matches TEXT");
        }

        // ── Timer tables ──────────────────────────────────────────────
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS timer_sessions (
                id TEXT PRIMARY KEY,
                instance_id TEXT NOT NULL,
                mode TEXT NOT NULL,
                phase TEXT NOT NULL,
                task_id TEXT,
                daily_plan_task_id TEXT,
                tag_id TEXT,
                started_at TEXT NOT NULL,
                completed_at TEXT NOT NULL,
                duration_sec INTEGER NOT NULL,
                was_completed INTEGER NOT NULL DEFAULT 1
            );
            CREATE INDEX IF NOT EXISTS idx_timer_sessions_completed ON timer_sessions(completed_at DESC);
            CREATE INDEX IF NOT EXISTS idx_timer_sessions_task ON timer_sessions(task_id);
            CREATE INDEX IF NOT EXISTS idx_timer_sessions_dp_task ON timer_sessions(daily_plan_task_id);
            CREATE INDEX IF NOT EXISTS idx_timer_sessions_tag ON timer_sessions(tag_id);

            CREATE TABLE IF NOT EXISTS timer_tags (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                color TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS timer_goals (
                id TEXT PRIMARY KEY,
                goal_type TEXT NOT NULL,
                target_value INTEGER NOT NULL,
                period_start TEXT NOT NULL,
                period_end TEXT NOT NULL,
                achieved_at TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_timer_goals_type ON timer_goals(goal_type);

            CREATE TABLE IF NOT EXISTS timer_milestones (
                id TEXT PRIMARY KEY,
                key TEXT NOT NULL UNIQUE,
                achieved_at TEXT NOT NULL
            );
            ",
        )
        .map_err(|e| format!("Failed to create timer tables: {e}"))?;

        // ── App usage tracking tables ─────────────────────────────────
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS app_usage_sessions (
                id TEXT PRIMARY KEY,
                app_view TEXT,
                kind TEXT NOT NULL,
                started_at INTEGER NOT NULL,
                ended_at INTEGER NOT NULL,
                duration_ms INTEGER NOT NULL,
                date_key TEXT NOT NULL,
                hour INTEGER NOT NULL,
                created_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_app_usage_date ON app_usage_sessions(date_key);
            CREATE INDEX IF NOT EXISTS idx_app_usage_app ON app_usage_sessions(app_view);
            CREATE INDEX IF NOT EXISTS idx_app_usage_kind ON app_usage_sessions(kind);
            CREATE INDEX IF NOT EXISTS idx_app_usage_started ON app_usage_sessions(started_at DESC);
            ",
        )
        .map_err(|e| format!("Failed to create app_usage_sessions table: {e}"))?;

        // One-time app-id rekey for the previewer → weblinks rename so existing
        // AI chat history + usage analytics stay attached to the renamed app
        // instead of being orphaned under the old id. Idempotent: after the
        // first run no rows match the old id.
        let _ = conn.execute(
            "UPDATE ai_assistant_sessions SET app_id = 'weblinks' WHERE app_id = 'previewer'",
            [],
        );
        let _ = conn.execute(
            "UPDATE app_usage_sessions SET app_view = 'weblinks' WHERE app_view = 'previewer'",
            [],
        );

        Ok(())
    }

    /// Write connection — use for INSERT/UPDATE/DELETE
    pub fn conn(&self) -> std::sync::MutexGuard<'_, Connection> {
        self.write_conn.lock().expect("DB write mutex poisoned")
    }

    /// Read connection — use for SELECT queries (won't block writes in WAL mode)
    pub fn reader(&self) -> std::sync::MutexGuard<'_, Connection> {
        self.read_conn.lock().expect("DB read mutex poisoned")
    }
}
