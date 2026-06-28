//! WebSocket endpoint that bridges a browser terminal to PTY sessions.
//!
//! Per-connection lifecycle: validate the token (before upgrade) -> approve the
//! device (auto-approve when it presents a still-valid trust grant, otherwise
//! emit ONE device-level approval request and block until the desktop
//! allows/denies, fail-safe: deny on timeout) -> hand the browser a fresh /
//! refreshed grant so its next reload skips the prompt -> send the tab list ->
//! then a single loop lets the client switch between any session (mirror) or
//! ask the desktop to open a new tab, pumping bytes for whichever tab is active.
//! A remote "new tab" is routed to the desktop Terminal app's real `createTab`,
//! so it is a genuine, locally-visible tab that outlives the connection; every
//! attached session is a mirror and is left running when the socket closes.

use std::net::SocketAddr;
use std::time::Duration;

use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::{ConnectInfo, Query, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use base64::Engine;
use futures_util::sink::SinkExt;
use futures_util::stream::{SplitSink, StreamExt};
use serde::Deserialize;
use tauri::{Emitter, Manager};
use tokio::sync::{broadcast, watch};
use uuid::Uuid;

use crate::commands::terminal::TerminalManager;

use super::router::RemoteCtx;
use super::types::{
    ApprovalRequestEvent, ClientInfo, ClientMessage, ClientsChangedEvent, CloseTabEvent,
    MirrorSizeEvent, NewTabEvent, RemoteTabInfo, ServerMessage, SessionInfo, SessionMode,
};

/// How long to wait for the desktop user to allow/deny before auto-denying.
const APPROVAL_TIMEOUT: Duration = Duration::from_secs(60);

/// How long to wait for the desktop Terminal app to honour a remote "new tab"
/// request (run `createTab` and report the created session id back) before
/// giving up and telling the client the tab could not be opened.
const NEW_TAB_TIMEOUT: Duration = Duration::from_secs(10);

#[derive(Debug, Deserialize)]
pub struct WsQuery {
    #[serde(default)]
    pub token: String,
    /// Optional trust grant from a prior approval. When present and still valid
    /// the connection is auto-approved (no desktop prompt) — this is what lets a
    /// page reload skip re-approval within the grant's lifetime.
    #[serde(default)]
    pub grant: String,
}

type Tx = SplitSink<WebSocket, Message>;

/// axum handler for `GET /ws`. Rejects bad tokens before upgrading.
pub async fn ws_handler(
    ws: WebSocketUpgrade,
    Query(query): Query<WsQuery>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(ctx): State<RemoteCtx>,
) -> Response {
    if !ctx.manager.validate_token(&query.token) {
        return (StatusCode::UNAUTHORIZED, "invalid or missing token").into_response();
    }
    let grant = query.grant;
    ws.on_upgrade(move |socket| handle_socket(socket, addr, ctx, grant))
}

async fn handle_socket(socket: WebSocket, addr: SocketAddr, ctx: RemoteCtx, grant: String) {
    let ip = addr.ip().to_string();
    let term = ctx.app.state::<TerminalManager>().inner().clone();
    let mut sessions_changed = term.subscribe_changes();
    let mut tabs_changed = ctx.manager.subscribe_tabs_changed();
    let mut perms_changed = ctx.manager.subscribe_perms_changed();
    let (mut ws_tx, mut ws_rx) = socket.split();

    // 1. ONE device-level approval gates everything (including the tab list).
    // A device that presents a still-valid trust grant (from a prior approval)
    // is auto-approved with no desktop prompt — this is what lets a page reload
    // skip re-approval. Otherwise we emit the approval request and block until
    // the desktop allows/denies (fail-safe: deny on timeout). Either way an
    // approved connection is handed a fresh / refreshed grant to store (sliding
    // TTL), so continued use keeps the device trusted.
    let grant_to_send: (String, i64);
    if let Some(expires_at) = ctx.manager.refresh_grant(&grant) {
        // Trusted device reconnecting: slide its grant forward, no prompt.
        grant_to_send = (grant, expires_at);
    } else {
        let request_id = Uuid::new_v4().to_string();
        let approval = ctx.manager.register_pending(&request_id);
        let _ = ctx.app.emit(
            "remote-terminal-approval-request",
            ApprovalRequestEvent {
                request_id: request_id.clone(),
                ip: ip.clone(),
            },
        );
        let _ = send_msg(&mut ws_tx, &ServerMessage::Pending).await;

        let approved = matches!(
            tokio::time::timeout(APPROVAL_TIMEOUT, approval).await,
            Ok(Ok(true))
        );
        ctx.manager.remove_pending(&request_id);
        if !approved {
            let _ = send_msg(
                &mut ws_tx,
                &ServerMessage::Denied {
                    reason: "The desktop did not approve this device".into(),
                },
            )
            .await;
            let _ = ws_tx.close().await;
            return;
        }
        // Fresh approval: mint a trust grant so the next reload skips the prompt.
        grant_to_send = ctx.manager.issue_grant();
    }

    // 2. Register the connection-level client.
    let client_id = Uuid::new_v4().to_string();
    let (close_tx, mut close_rx) = watch::channel(false);
    ctx.manager.register_client(
        ClientInfo {
            client_id: client_id.clone(),
            ip: ip.clone(),
            connected_at: chrono::Utc::now().timestamp_millis(),
        },
        close_tx,
    );
    emit_clients_changed(&ctx);

    // Hand the (fresh or refreshed) trust grant to the browser so it can store it
    // and skip the approval prompt on its next reload.
    let (grant_value, grant_expires_at) = grant_to_send;
    let _ = send_msg(
        &mut ws_tx,
        &ServerMessage::Granted {
            grant: grant_value,
            expires_at: grant_expires_at,
        },
    )
    .await;

    // 3. Advertise the current device permissions first so the client knows
    // which controls to show before it auto-attaches, then send the tab list;
    // the client drives attach via switch/new.
    let _ = send_permissions(&mut ws_tx, &ctx).await;
    let _ = send_msg(
        &mut ws_tx,
        &ServerMessage::Sessions {
            sessions: sessions_of(&ctx.manager.tabs(), &term),
        },
    )
    .await;

    // 4. Active-tab bridge state.
    let mut active: Option<String> = None;
    let mut active_owned = false;
    let mut out_rx: Option<broadcast::Receiver<Vec<u8>>> = None;
    let mut cols: u16 = 80;
    let mut rows: u16 = 24;

    loop {
        tokio::select! {
            _ = close_rx.changed() => break,

            changed = sessions_changed.recv() => {
                if !matches!(changed, Err(broadcast::error::RecvError::Closed)) {
                    if send_msg(
                        &mut ws_tx,
                        &ServerMessage::Sessions { sessions: sessions_of(&ctx.manager.tabs(), &term) },
                    )
                    .await
                    .is_err()
                    {
                        break;
                    }
                    // If the active tab vanished (closed on the desktop), tell the client.
                    if let Some(id) = active.clone() {
                        if !term.contains(&id) {
                            let _ = send_msg(
                                &mut ws_tx,
                                &ServerMessage::SessionExit { session_id: id },
                            )
                            .await;
                            active = None;
                            active_owned = false;
                            out_rx = None;
                        }
                    }
                }
            }

            changed = tabs_changed.recv() => {
                if !matches!(changed, Err(broadcast::error::RecvError::Closed))
                    && send_msg(
                        &mut ws_tx,
                        &ServerMessage::Sessions {
                            sessions: sessions_of(&ctx.manager.tabs(), &term),
                        },
                    )
                    .await
                    .is_err()
                {
                    break;
                }
            }

            changed = perms_changed.recv() => {
                if !matches!(changed, Err(broadcast::error::RecvError::Closed))
                    && send_permissions(&mut ws_tx, &ctx).await.is_err()
                {
                    break;
                }
            }

            incoming = ws_rx.next() => match incoming {
                Some(Ok(Message::Text(text))) => {
                    match serde_json::from_str::<ClientMessage>(&text) {
                        Ok(ClientMessage::Switch { session_id, cols: c, rows: r }) => {
                            cols = c.max(1);
                            rows = r.max(1);
                            if term.contains(&session_id) {
                                // Leaving a mirrored tab? Release it so the desktop
                                // reclaims its own size (no longer remote-driven).
                                if !active_owned {
                                    if let Some(prev) = &active {
                                        if prev != &session_id {
                                            emit_mirror_size(&ctx, prev, cols, rows, false);
                                        }
                                    }
                                }
                                active_owned = false;
                                let history_snapshot = match term
                                    .subscribe_with_history(&session_id)
                                {
                                    Some((snapshot, rx)) => {
                                        out_rx = Some(rx);
                                        snapshot
                                    }
                                    None => {
                                        out_rx = None;
                                        Vec::new()
                                    }
                                };
                                active = Some(session_id.clone());
                                let mode = if active_owned {
                                    SessionMode::Dedicated
                                } else {
                                    SessionMode::Mirror
                                };
                                // Option B: a mirror client drives the shared PTY size.
                                // Resize the desktop tab's PTY to the viewer's viewport
                                // and tell the desktop to follow (and stop pushing its
                                // own size) until this client releases the tab.
                                if !active_owned {
                                    let _ = term.resize(&session_id, cols, rows);
                                    emit_mirror_size(&ctx, &session_id, cols, rows, true);
                                }
                                let _ = send_msg(
                                    &mut ws_tx,
                                    &ServerMessage::Attached { session_id, mode },
                                )
                                .await;
                                // Replay retained scrollback so the client can
                                // scroll back through history that predates this
                                // attach. Sent after `Attached` (the client resets
                                // its screen on it) and before any live output, so
                                // it lands at the top of the client's scrollback.
                                if !history_snapshot.is_empty() {
                                    let data = base64::engine::general_purpose::STANDARD
                                        .encode(&history_snapshot);
                                    let _ =
                                        send_msg(&mut ws_tx, &ServerMessage::Output { data }).await;
                                }
                            } else {
                                let _ = send_msg(
                                    &mut ws_tx,
                                    &ServerMessage::Error {
                                        message: "That terminal tab no longer exists".into(),
                                    },
                                )
                                .await;
                            }
                        }
                        Ok(ClientMessage::New { cols: c, rows: r }) => {
                            if !ctx.manager.permissions().allow_new_tab {
                                let _ = send_msg(
                                    &mut ws_tx,
                                    &ServerMessage::Error {
                                        message: "Opening new tabs is disabled by the host".into(),
                                    },
                                )
                                .await;
                            } else {
                                cols = c.max(1);
                                rows = r.max(1);
                                // Route the request to the desktop Terminal app's real
                                // `createTab` so the new tab is a genuine, locally-visible
                                // app tab (and survives this socket) rather than a private
                                // dedicated shell. Emit the request, then block (bounded)
                                // until the desktop reports the created session id back via
                                // `cmd_remote_terminal_attach_new`.
                                let request_id = Uuid::new_v4().to_string();
                                let created = ctx.manager.register_pending_new(&request_id);
                                let _ = ctx.app.emit(
                                    "remote-terminal-new-tab",
                                    NewTabEvent {
                                        request_id: request_id.clone(),
                                        cols,
                                        rows,
                                    },
                                );
                                let new_id =
                                    match tokio::time::timeout(NEW_TAB_TIMEOUT, created).await {
                                        Ok(Ok(id)) if !id.is_empty() && term.contains(&id) => {
                                            Some(id)
                                        }
                                        _ => None,
                                    };
                                ctx.manager.remove_pending_new(&request_id);
                                match new_id {
                                    Some(session_id) => {
                                        // A real desktop tab now exists. Attach as a mirror
                                        // (NOT owned, so it isn't killed when this socket
                                        // closes) and let the phone drive its size (Option B).
                                        if !active_owned {
                                            if let Some(prev) = &active {
                                                if prev != &session_id {
                                                    emit_mirror_size(
                                                        &ctx, prev, cols, rows, false,
                                                    );
                                                }
                                            }
                                        }
                                        active_owned = false;
                                        let history_snapshot = match term
                                            .subscribe_with_history(&session_id)
                                        {
                                            Some((snapshot, rx)) => {
                                                out_rx = Some(rx);
                                                snapshot
                                            }
                                            None => {
                                                out_rx = None;
                                                Vec::new()
                                            }
                                        };
                                        active = Some(session_id.clone());
                                        let _ = term.resize(&session_id, cols, rows);
                                        emit_mirror_size(&ctx, &session_id, cols, rows, true);
                                        let _ = send_msg(
                                            &mut ws_tx,
                                            &ServerMessage::Attached {
                                                session_id,
                                                mode: SessionMode::Mirror,
                                            },
                                        )
                                        .await;
                                        if !history_snapshot.is_empty() {
                                            let data = base64::engine::general_purpose::STANDARD
                                                .encode(&history_snapshot);
                                            let _ = send_msg(
                                                &mut ws_tx,
                                                &ServerMessage::Output { data },
                                            )
                                            .await;
                                        }
                                    }
                                    None => {
                                        let _ = send_msg(
                                            &mut ws_tx,
                                            &ServerMessage::Error {
                                                message: "Could not open a new tab".into(),
                                            },
                                        )
                                        .await;
                                    }
                                }
                            }
                        }
                        Ok(ClientMessage::CloseTab { session_id }) => {
                            if !ctx.manager.permissions().allow_close_tab {
                                let _ = send_msg(
                                    &mut ws_tx,
                                    &ServerMessage::Error {
                                        message: "Closing tabs is disabled by the host".into(),
                                    },
                                )
                                .await;
                            } else if ctx.manager.tabs().iter().any(|t| t.id == session_id) {
                                // Route to the desktop app's own closeTab so the tab is truly
                                // removed (kill PTY + drop tab + collapse pane); the app then
                                // re-pushes its tab list and every client refreshes.
                                let _ = ctx
                                    .app
                                    .emit("remote-terminal-close-tab", CloseTabEvent { session_id });
                            } else {
                                let _ = send_msg(
                                    &mut ws_tx,
                                    &ServerMessage::Error {
                                        message: "That terminal tab no longer exists".into(),
                                    },
                                )
                                .await;
                            }
                        }
                        Ok(ClientMessage::Input { data }) => {
                            if let Some(id) = &active {
                                if let Ok(bytes) = base64::engine::general_purpose::STANDARD
                                    .decode(data.as_bytes())
                                {
                                    let _ = term.write(id, &bytes);
                                }
                            }
                        }
                        Ok(ClientMessage::Resize { cols: c, rows: r }) => {
                            cols = c.max(1);
                            rows = r.max(1);
                            // Option B: the active remote client drives the shared PTY
                            // size for BOTH dedicated shells and mirrored desktop tabs.
                            // For a mirror, also tell the desktop to follow the new size.
                            if let Some(id) = &active {
                                let _ = term.resize(id, cols, rows);
                                if !active_owned {
                                    emit_mirror_size(&ctx, id, cols, rows, true);
                                }
                            }
                        }
                        Err(_) => {}
                    }
                }
                Some(Ok(Message::Binary(bytes))) => {
                    if let Some(id) = &active {
                        let _ = term.write(id, &bytes);
                    }
                }
                Some(Ok(Message::Close(_))) | None => break,
                Some(Ok(_)) => {}
                Some(Err(_)) => break,
            },

            recv = next_output(&mut out_rx) => match recv {
                Ok(bytes) => {
                    let data = base64::engine::general_purpose::STANDARD.encode(&bytes);
                    if send_msg(&mut ws_tx, &ServerMessage::Output { data }).await.is_err() {
                        break;
                    }
                }
                Err(broadcast::error::RecvError::Lagged(_)) => {}
                Err(broadcast::error::RecvError::Closed) => {
                    if let Some(id) = active.take() {
                        let _ = send_msg(
                            &mut ws_tx,
                            &ServerMessage::SessionExit { session_id: id },
                        )
                        .await;
                    }
                    active_owned = false;
                    out_rx = None;
                }
            },
        }
    }

    // 5. Clean up. If this connection was driving a mirrored desktop tab's size,
    // release it so the desktop reclaims its own dimensions. Every remote tab is
    // a mirror of a real desktop tab, so nothing is killed here — the desktop
    // owns each tab's lifetime.
    if !active_owned {
        if let Some(id) = &active {
            emit_mirror_size(&ctx, id, cols, rows, false);
        }
    }
    ctx.manager.unregister_client(&client_id);
    emit_clients_changed(&ctx);
}

/// Await the active tab's next output chunk, or pend forever when no tab is
/// attached (so the `select!` branch stays dormant until one is).
async fn next_output(
    rx: &mut Option<broadcast::Receiver<Vec<u8>>>,
) -> Result<Vec<u8>, broadcast::error::RecvError> {
    match rx {
        Some(r) => r.recv().await,
        None => std::future::pending().await,
    }
}

/// Build the advertised session list from the desktop Terminal app's pushed tab
/// list (ordered, with titles), keeping only tabs whose PTY is still live. This
/// scopes the remote view to exactly the app's open tabs — the dock terminal and
/// orphaned / dedicated PTYs are never advertised.
fn sessions_of(tabs: &[RemoteTabInfo], term: &TerminalManager) -> Vec<SessionInfo> {
    tabs.iter()
        .filter_map(|t| {
            let meta = term.meta(&t.id)?;
            Some(SessionInfo {
                id: t.id.clone(),
                title: t.title.clone(),
                shell: meta.shell,
                cwd: meta.cwd,
            })
        })
        .collect()
}

fn emit_clients_changed(ctx: &RemoteCtx) {
    let _ = ctx.app.emit(
        "remote-terminal-clients-changed",
        ClientsChangedEvent {
            clients: ctx.manager.snapshot_clients(),
        },
    );
}

/// Tell the desktop Terminal app that a remote mirror client started (or
/// stopped) driving a shared tab's size. While `controlled`, the desktop resizes
/// that tab's xterm to `cols`x`rows` and suppresses its own fit-based resizing;
/// on release it reclaims its own dimensions. Only meaningful for mirror tabs.
fn emit_mirror_size(ctx: &RemoteCtx, session_id: &str, cols: u16, rows: u16, controlled: bool) {
    let _ = ctx.app.emit(
        "remote-terminal-mirror-size",
        MirrorSizeEvent {
            session_id: session_id.to_string(),
            cols,
            rows,
            controlled,
        },
    );
}

async fn send_msg(ws_tx: &mut Tx, msg: &ServerMessage) -> Result<(), axum::Error> {
    let text = serde_json::to_string(msg)
        .unwrap_or_else(|_| String::from(r#"{"type":"error","message":"serialize failed"}"#));
    ws_tx.send(Message::Text(text)).await
}

/// Send the host's current device permissions to a client so it can show or
/// hide its new-tab (+) and close (x) controls.
async fn send_permissions(ws_tx: &mut Tx, ctx: &RemoteCtx) -> Result<(), axum::Error> {
    let p = ctx.manager.permissions();
    send_msg(
        ws_tx,
        &ServerMessage::Permissions {
            allow_new_tab: p.allow_new_tab,
            allow_close_tab: p.allow_close_tab,
        },
    )
    .await
}
