mod ai_provider;
mod commands;
mod database;
mod file_walker;
mod global_shortcut;
mod helpers;
mod llm_client;
mod mcp;
mod menu;
mod messaging;
mod prompts;
mod tray;
mod types;

use commands::*;
use database::{Database, seed_default_clipboard_labels_db};
use helpers::{ensure_data_dir, get_db_path};
use std::sync::Arc;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    ensure_data_dir();
    let db = Database::new(&get_db_path()).expect("Failed to initialize database");
    seed_default_clipboard_labels_db(&db);
    let db_arc = Arc::new(db);

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .register_uri_scheme_protocol("library-image", handle_library_image_request)
        .register_uri_scheme_protocol("webpoint", handle_webpoint_render_request)
        .manage(AppState {
            db: db_arc.clone(),
            pending_app_data: std::sync::Mutex::new(None),
            app_data_version: std::sync::atomic::AtomicU64::new(0),
            api_in_flight: std::sync::Mutex::new(std::collections::HashMap::new()),
        })
        .manage(db_arc.clone())
        .manage(MockServerState::new())
        .manage(WhisperState::new())
        .manage(TtsState::new())
        .manage(mcp::McpManager::new())
        .manage(messaging::MessagingManager::new())
        .manage(commands::terminal::TerminalManager::new())
        .manage(commands::remote_terminal::RemoteTerminalManager::new())
        .manage(commands::monitor::MonitorManager::new())
        .manage(commands::quickshare::QuickShareManager::new())
        .manage(commands::content_share::ContentShareManager::new())
        .manage(WebpointRenderState::new())
        .manage(commands::KeepAwakeState::new())
        .manage(commands::PreviewerWebviewState::new())
        .setup({
            let db_arc = db_arc.clone();
            move |app| {
                if cfg!(debug_assertions) {
                    app.handle().plugin(
                        tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build(),
                    )?;
                }

                // Replace the default macOS menu with one that omits the Cmd+W
                // "Close Window" item, freeing Cmd+W for the in-app keyboard
                // shortcut dispatcher (terminal.closeTab and other Mod+W
                // close-tab actions). The red traffic-light button still closes
                // the window via the existing close-requested handler.
                #[cfg(target_os = "macos")]
                match menu::build_macos_menu(app.handle()) {
                    Ok(app_menu) => {
                        if let Err(e) = app.set_menu(app_menu) {
                            log::warn!("Failed to install custom app menu: {e}");
                        }
                    }
                    Err(e) => log::warn!("Failed to build custom app menu: {e}"),
                }
                // Start clipboard monitor
                let monitor_control = Arc::new(ClipboardMonitorControl::new());
                app.handle().manage(monitor_control.clone());
                let shutdown = start_clipboard_monitor(app.handle().clone(), db_arc.clone(), monitor_control);
                app.handle().manage(std::sync::Mutex::new(Some(shutdown)));

                // One-time backfill of clipboard content analysis for rows captured
                // before the analysis columns existed. Runs off the main thread so
                // it never blocks app startup.
                {
                    let db_backfill = db_arc.clone();
                    std::thread::spawn(move || {
                        let n = backfill_clipboard_analysis(&db_backfill);
                        if n > 0 {
                            log::info!("[clipboard] backfilled analysis for {n} item(s)");
                        }
                    });
                }

                // Register global shortcut for clipboard manager (Cmd+Option+Control+C)
                if let Err(e) = global_shortcut::register_clipboard_shortcut(app.handle()) {
                    log::warn!("Failed to register global clipboard shortcut: {e}");
                }

                // Initialise the Timer menubar tray icon
                if let Err(e) = tray::timer_tray::init_timer_tray(app.handle()) {
                    log::warn!("Failed to init timer tray: {e}");
                }

                Ok(())
            }
        })
        .invoke_handler(tauri::generate_handler![
            load_projects, create_project, delete_project, rename_project, set_active_project,
            cmd_load_settings, cmd_save_settings, cmd_load_app_data, cmd_save_app_data,
            cmd_get_ai_providers, cmd_set_ai_provider_key, cmd_clear_ai_provider_key,
            cmd_load_live_sports_tiles, cmd_save_live_sports_tiles,
            cmd_get_local_repo_items, cmd_get_local_file_content,
            cmd_write_local_file_content,
            cmd_get_local_media_data_url, cmd_select_local_repo,
            cmd_get_user_directories,
            cmd_load_explorer_history, cmd_save_explorer_repo, cmd_remove_explorer_repo,
            cmd_clear_explorer_history,
            cmd_is_local_git_repo, cmd_get_git_status, cmd_get_git_log, cmd_get_git_commit_count, cmd_get_git_commit_calendar, cmd_get_git_worktrees,
            cmd_get_git_branch,
            cmd_get_local_file_git_history, cmd_get_local_file_at_commit,
            cmd_git_blame,
            cmd_get_git_remote_url,
            cmd_git_snapshot,
            cmd_git_operation_state,
            cmd_fs_start_watching, cmd_fs_stop_watching,
            cmd_git_stage_files, cmd_git_unstage_files, cmd_git_discard_changes,
            cmd_git_commit, cmd_git_push, cmd_git_pull, cmd_git_fetch,
            cmd_git_get_branches, cmd_git_checkout_branch, cmd_git_get_diff,
            cmd_git_get_commit_context,
            // Phase 2 git tools
            cmd_git_stash_list, cmd_git_stash_save, cmd_git_stash_pop,
            cmd_git_stash_apply, cmd_git_stash_drop, cmd_git_stash_show,
            cmd_git_branch_create, cmd_git_branch_delete, cmd_git_branch_rename,
            cmd_git_commit_amend, cmd_git_reset, cmd_git_revert,
            cmd_git_clean, cmd_git_restore,
            // Phase 3 git tools — multi-step flows
            cmd_git_merge, cmd_git_merge_abort, cmd_git_merge_continue,
            cmd_git_rebase, cmd_git_rebase_continue, cmd_git_rebase_abort, cmd_git_rebase_skip,
            cmd_git_cherry_pick, cmd_git_cherry_pick_continue, cmd_git_cherry_pick_abort,
            cmd_git_bisect, cmd_git_reflog,
            // Phase 4 git tools — tags / remotes / submodules / worktree writes
            cmd_git_tag_create, cmd_git_tag_delete, cmd_git_tag_list, cmd_git_tag_push,
            cmd_git_remote_list, cmd_git_remote_add, cmd_git_remote_remove, cmd_git_remote_set_url,
            cmd_git_submodule_status, cmd_git_submodule_update, cmd_git_submodule_add, cmd_git_submodule_sync,
            cmd_git_worktree_add, cmd_git_worktree_remove, cmd_git_worktree_prune,
            // Phase 5 git tools — patches / archive / notes / inspection / config / clone / init
            cmd_git_apply_patch, cmd_git_format_patch, cmd_git_am,
            cmd_git_archive,
            cmd_git_notes_show, cmd_git_notes_add, cmd_git_notes_remove,
            cmd_git_describe, cmd_git_show, cmd_git_ls_files, cmd_git_ls_tree, cmd_git_grep,
            cmd_git_config_get, cmd_git_config_set,
            cmd_git_clone, cmd_git_init,
            cmd_load_chat_history, cmd_save_chat_conversation, cmd_remove_chat_conversation,
            cmd_clear_chat_history, cmd_chat_send_message,
            cmd_save_chat_image, cmd_get_chat_image,
            cmd_load_chat_list, cmd_load_conversation_messages, cmd_append_chat_message,
            cmd_save_tool_calls, cmd_load_tool_calls,
            cmd_load_tool_call_summaries, cmd_load_tool_calls_by_message,
            cmd_execute_single_tool,
            cmd_llm_json_completion,
            cmd_llm_stream_completion,
            cmd_load_prompts, cmd_save_prompt, cmd_remove_prompt,
            cmd_toggle_prompt_favorite, cmd_increment_prompt_usage,
            cmd_load_snippets, cmd_save_snippet, cmd_remove_snippet,
            cmd_toggle_snippet_favorite,
            cmd_load_commands, cmd_save_command, cmd_remove_command,
            cmd_load_books, cmd_save_book, cmd_remove_book,
            cmd_load_book_with_chapters, cmd_load_chapter_content, cmd_save_chapter, cmd_remove_chapter,
            cmd_save_chapter_translation, cmd_load_chapter_translations,
            cmd_load_chapter_translation_content, cmd_remove_chapter_translation,
            cmd_load_bookmarks, cmd_load_bookmarks_for_chapter, cmd_save_bookmark, cmd_remove_bookmark,
            cmd_cache_chapter_images, cmd_load_chapter_images,
            cmd_load_cached_image_as_data_url, cmd_remove_book_images,
            // WebPoint (AI Presentations)
            cmd_load_presentations, cmd_save_presentation, cmd_remove_presentation,
            cmd_load_presentation_with_slides, cmd_save_slide, cmd_remove_slide, cmd_reorder_slides,
            cmd_webpoint_stage_slide,
            // Saved Webpages
            cmd_load_webpages, cmd_save_webpage, cmd_remove_webpage,
            cmd_load_webpage_content, cmd_update_webpage,
            cmd_save_webpage_from_html, cmd_rename_webpage, cmd_update_webpage_content,
            cmd_pm_load_all, cmd_pm_save_folder, cmd_pm_remove_folder,
            cmd_pm_save_category, cmd_pm_remove_category,
            cmd_pm_save_prompt, cmd_pm_remove_prompt,
            cmd_write_binary_file,
            cmd_zoom_in, cmd_zoom_out, cmd_zoom_reset, cmd_get_zoom_level,
            cmd_keep_awake_start, cmd_keep_awake_stop, cmd_keep_awake_status,
            cmd_quit_app,
            cmd_delete_all_data, cmd_reset_all_settings,
            cmd_execute_raw_query, cmd_get_table_names,
            cmd_load_research_sources, cmd_save_research_source, cmd_remove_research_source,
            cmd_research_send_query,
            cmd_is_directory,
            cmd_crawl_webpage,
            cmd_crawl_webpage_lite,
            cmd_fetch_link_preview,
            cmd_previewer_load_all,
            cmd_previewer_save_folder,
            cmd_previewer_remove_folder,
            cmd_previewer_save_preview,
            cmd_previewer_remove_preview,
            cmd_previewer_clear_all,
            cmd_list_browser_bookmark_sources,
            cmd_import_browser_bookmarks,
            cmd_previewer_save_previews,
            cmd_previewer_extract_urls_from_image,
            cmd_previewer_webview_show,
            cmd_previewer_webview_set_bounds,
            cmd_previewer_webview_hide,
            cmd_previewer_webview_reload,
            cmd_previewer_webview_close,
            cmd_grep_search,
            cmd_find_files,
            cmd_list_repo_files,
            cmd_create_file,
            cmd_create_folder,
            cmd_delete_item,
            cmd_soft_delete_item,
            cmd_rename_item,
            cmd_move_item,
            cmd_copy_item,
            cmd_get_disk_usage,
            cmd_explorer_ai_command,
            cmd_explorer_ai_shell_respond,
            cmd_open_in_terminal,
            cmd_open_in_vscode,
            cmd_list_browsers,
            cmd_open_urls_in_browser,
            cmd_save_notification,
            cmd_load_notifications,
            cmd_remove_notification,
            cmd_remove_all_notifications,
            cmd_mark_notification_read,
            cmd_mark_all_notifications_read,
            cmd_count_unread_notifications,
            cmd_load_news_tile, cmd_save_news_tile,
            cmd_load_news_interests, cmd_save_news_interests,
            cmd_load_news_articles, cmd_load_liked_news_articles,
            cmd_save_news_articles, cmd_toggle_news_article_liked,
            cmd_delete_news_articles_for_interest,
            cmd_load_stocks_tile, cmd_save_stocks_tile,
            cmd_load_stocks_watchlist, cmd_save_stocks_watchlist,
            cmd_delete_stocks_watch_item,
            cmd_load_stocks_news, cmd_save_stocks_news,
            cmd_stocks_search, cmd_stocks_fetch_quote,
            cmd_stocks_fetch_history, cmd_stocks_fetch_news,
            cmd_stocks_fetch_custom_price,
            cmd_api_load_all, cmd_api_load_request_body,
            cmd_api_save_collection, cmd_api_save_folder, cmd_api_save_request,
            cmd_api_remove_collection, cmd_api_remove_folder, cmd_api_remove_request,
            cmd_api_send_request,
            cmd_api_cancel_request,
            cmd_api_save_environment, cmd_api_set_active_environment, cmd_api_remove_environment,
            cmd_api_load_environment_variables, cmd_api_save_environment_variable, cmd_api_remove_environment_variable,
            cmd_api_load_history, cmd_api_load_request_analytics, cmd_api_load_execution_response, cmd_api_remove_execution, cmd_api_clear_history,
            cmd_api_load_cookie_jars, cmd_api_load_cookies, cmd_api_save_cookie_jar, cmd_api_save_cookie, cmd_api_remove_cookie, cmd_api_clear_cookie_jar,
            cmd_api_save_response_snapshot, cmd_api_load_response_snapshots, cmd_api_remove_response_snapshot,
            cmd_api_save_example, cmd_api_load_examples, cmd_api_remove_example,
            cmd_load_ai_sessions, cmd_save_ai_session, cmd_remove_ai_session, cmd_clear_ai_sessions,
            cmd_load_notes, cmd_save_note, cmd_remove_note, cmd_toggle_note_pin,
            cmd_search_note_suggestions,
            cmd_load_all_notes,
            cmd_load_note_notebooks, cmd_save_note_notebook, cmd_remove_note_notebook, cmd_reorder_note_notebooks,
            cmd_load_note_projects, cmd_save_note_project, cmd_remove_note_project, cmd_reorder_note_projects, cmd_move_note_notebook,
            cmd_load_note_sections, cmd_save_note_section, cmd_remove_note_section, cmd_reorder_note_sections, cmd_move_note_section,
            cmd_load_note_topics, cmd_save_note_topic, cmd_remove_note_topic, cmd_reorder_note_topics, cmd_move_note_topic,
            cmd_load_note_labels, cmd_save_note_label, cmd_remove_note_label, cmd_set_note_labels,
            cmd_load_note_highlights, cmd_save_note_highlight, cmd_remove_note_highlight, cmd_remove_note_highlights_in_range,
            cmd_move_note, cmd_reorder_notes,
            cmd_toggle_note_favorite, cmd_trash_note, cmd_restore_note_from_trash,
            cmd_empty_trash, cmd_duplicate_note, cmd_load_trashed_notes,
            // Mock Server
            cmd_mock_load_projects, cmd_mock_create_project, cmd_mock_update_project, cmd_mock_delete_project,
            cmd_mock_load_servers, cmd_mock_create_server, cmd_mock_update_server, cmd_mock_delete_server, cmd_mock_duplicate_server,
            cmd_mock_load_endpoints, cmd_mock_create_endpoint, cmd_mock_update_endpoint,
            cmd_mock_delete_endpoint, cmd_mock_duplicate_endpoint,
            cmd_mock_load_variants, cmd_mock_create_variant, cmd_mock_update_variant, cmd_mock_delete_variant,
            cmd_mock_check_port, cmd_mock_suggest_port,
            cmd_mock_start_server, cmd_mock_stop_server, cmd_mock_stop_all_servers, cmd_mock_get_running,
            cmd_mock_load_logs, cmd_mock_clear_logs, cmd_mock_export_logs,
            // Daily Plan
            cmd_dp_save_task, cmd_dp_load_tasks, cmd_dp_remove_task, cmd_dp_reorder_tasks, cmd_dp_bulk_update_status,
            cmd_dp_save_review, cmd_dp_load_reviews, cmd_dp_remove_review,
            cmd_dp_save_meeting, cmd_dp_load_meetings, cmd_dp_remove_meeting,
            cmd_dp_save_daily_entry, cmd_dp_load_daily_entry, cmd_dp_load_daily_entries_range,
            cmd_dp_save_daily_status, cmd_dp_load_daily_status,
            cmd_dp_save_category, cmd_dp_load_categories, cmd_dp_remove_category,
            cmd_dp_save_template, cmd_dp_load_templates, cmd_dp_remove_template,
            cmd_dp_search_tasks, cmd_dp_search_meetings,
            // Daily Plan AI
            cmd_dailyplan_ai_completion,
            // Whisper Voice Input
            cmd_whisper_download_model, cmd_whisper_list_models, cmd_whisper_delete_model,
            cmd_whisper_transcribe_chunk, cmd_whisper_cancel,
            // TTS Text-to-Speech
            cmd_tts_download_model, cmd_tts_list_models, cmd_tts_delete_model,
            cmd_tts_synthesize, cmd_tts_cancel, cmd_tts_list_voices,
            // MCP Servers
            cmd_mcp_list_servers, cmd_mcp_add_server, cmd_mcp_remove_server,
            cmd_mcp_connect_server, cmd_mcp_disconnect_server, cmd_mcp_list_tools,
            cmd_mcp_connect_all, cmd_mcp_get_presets, cmd_mcp_import_vscode,
            cmd_mcp_sync_vscode, cmd_mcp_call_tool,
            // Clipboard Manager
            cmd_load_clipboard_items, cmd_remove_clipboard_item, cmd_update_clipboard_text,
            cmd_toggle_clipboard_pin, cmd_clear_clipboard_items, cmd_copy_clipboard_item,
            cmd_get_clipboard_image, cmd_reveal_clipboard_image, cmd_clipboard_stats,
            cmd_update_clipboard_image_description,
            // Clipboard Labels
            cmd_create_clipboard_label, cmd_load_clipboard_labels, cmd_update_clipboard_label,
            cmd_delete_clipboard_label, cmd_add_label_to_clipboard_item,
            cmd_remove_label_from_clipboard_item, cmd_load_labels_for_clipboard_item,
            // Clipboard Image Analysis
            cmd_analyze_clipboard_image,
            cmd_load_clipboard_items_by_date,
            cmd_set_clipboard_max_items,
            cmd_set_clipboard_add_once,
            cmd_set_clipboard_enabled,
            // Timer
            cmd_save_timer_session, cmd_load_timer_sessions, cmd_remove_timer_session,
            cmd_save_timer_tag, cmd_load_timer_tags, cmd_remove_timer_tag,
            cmd_save_timer_goal, cmd_load_timer_goals,
            cmd_save_timer_milestone, cmd_load_timer_milestones,
            cmd_get_timer_stats,
            cmd_set_timer_tray_title, cmd_set_timer_tray_visible,
            cmd_open_timer_focus_window, cmd_close_timer_focus_window,
            // Usage tracking
            cmd_save_usage_session, cmd_get_usage_stats, cmd_clear_usage_data,
            // Custom Themes
            cmd_list_custom_themes, cmd_save_custom_theme, cmd_delete_custom_theme,
            // Code — shared backend commands (Code Review, Chat, API Client, etc.)
            cmd_code_read_file, cmd_code_read_file_as_data_url, cmd_code_write_file,
            cmd_code_walk, cmd_code_ai_completion,
            // Terminal — PTY-backed integrated terminal
            cmd_terminal_create, cmd_terminal_write, cmd_terminal_resize,
            cmd_terminal_kill, cmd_terminal_list, cmd_terminal_default_shell,
            cmd_terminal_cwd, cmd_terminal_history_read, cmd_terminal_list_dir,
            cmd_terminal_session_save, cmd_terminal_session_load,
            cmd_terminal_session_delete, cmd_terminal_session_prune,
            // Remote Terminal — LAN browser access via QR (token + approval gated)
            cmd_remote_terminal_start, cmd_remote_terminal_stop, cmd_remote_terminal_status,
            cmd_remote_terminal_approve, cmd_remote_terminal_deny, cmd_remote_terminal_disconnect,
            cmd_remote_terminal_set_tabs, cmd_remote_terminal_set_permissions,
            cmd_remote_terminal_attach_new,
            // Monitor — LAN camera + mic streaming via QR (token + approval gated)
            cmd_monitor_start, cmd_monitor_stop, cmd_monitor_status,
            cmd_monitor_approve, cmd_monitor_deny, cmd_monitor_disconnect,
            cmd_monitor_send_signal,
            // QuickShare — LAN file/text drop hub via QR (token gated)
            cmd_quickshare_start, cmd_quickshare_stop, cmd_quickshare_status,
            cmd_quickshare_add_files, cmd_quickshare_add_text, cmd_quickshare_remove_item,
            cmd_quickshare_remove_all, cmd_quickshare_reveal_item, cmd_quickshare_download_all,
            cmd_quickshare_zip_and_send,
            // Content Share — share books + notes between Genisys devices on the LAN (mDNS + approval gated)
            cmd_content_share_start, cmd_content_share_stop, cmd_content_share_status,
            cmd_content_share_list_devices, cmd_content_share_set_device_name,
            cmd_content_share_respond, cmd_content_share_send_book, cmd_content_share_send_notes,
            // Messages — P2P E2E-encrypted LAN messaging
            cmd_msg_start, cmd_msg_get_identity, cmd_msg_set_display_name,
            cmd_msg_get_peers, cmd_msg_connect, cmd_msg_disconnect,
            cmd_msg_send_text, cmd_msg_send_image, cmd_msg_verify_peer,
            cmd_msg_send_signal,
            cmd_msg_send_control,
            cmd_msg_set_typing, cmd_msg_rotate_identity,
            cmd_msg_rescan,
            cmd_msg_set_offline,
            cmd_msg_accept_request, cmd_msg_reject_request,
            // Native macOS camera/microphone permission pre-flight
            cmd_av_authorization_status, cmd_request_av_access, cmd_open_privacy_settings,
            // Native macOS Accessibility (input-simulation) permission flow
            cmd_accessibility_status, cmd_request_accessibility, cmd_open_accessibility_settings,
            // Keep Awake — lid-close sleep prevention (cross-platform)
            cmd_keep_awake_lid_set, cmd_keep_awake_lid_status,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            // On app exit, gracefully shut down every LSP server we
            // spawned so we don't orphan typescript-language-server /
            // rust-analyzer / etc. processes.
            if let tauri::RunEvent::ExitRequested { .. } | tauri::RunEvent::Exit = &event {
                // Restore normal sleep behaviour if "stay awake with the lid
                // closed" was left active, so quitting Genisys never leaves the
                // machine unable to sleep.
                commands::revert_lid_close_on_exit(
                    app_handle.state::<commands::KeepAwakeState>().inner(),
                );
            }
        });
}
