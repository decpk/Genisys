//! Shared serde types for the remote-terminal feature: the WebSocket wire
//! protocol (browser <-> server), the Tauri events pushed to the desktop UI,
//! and the command response payloads. JSON is camelCase on the wire to match
//! the rest of the app; the WS protocol is internally tagged via `type`.

use serde::{Deserialize, Serialize};

/// Which kind of session a remote client attaches to.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SessionMode {
    /// Attach to an existing desktop session (shared, collaborative view).
    Mirror,
    /// Spawn a fresh shell owned by — and torn down with — this connection.
    Dedicated,
}

/// A terminal session advertised to the remote client so it can pick one to
/// mirror. Carries the desktop Terminal app's human tab `title` (what the app
/// shows in its tab strip) on top of the raw `TerminalSession` shell/cwd.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionInfo {
    pub id: String,
    pub title: String,
    pub shell: String,
    pub cwd: Option<String>,
}

/// A terminal tab the desktop Terminal app advertises to remote clients: the
/// backend PTY session `id` plus the human `title` shown in the app's tab strip.
/// Pushed (ordered) via `cmd_remote_terminal_set_tabs`; the WS bridge intersects
/// it with live sessions so the remote sees exactly the app's open tabs — never
/// the dock terminal or orphaned PTYs.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoteTabInfo {
    pub id: String,
    pub title: String,
}

/// Host-controlled permissions governing what an approved remote device may do
/// with tabs. Pushed from the desktop via `cmd_remote_terminal_set_permissions`,
/// advertised to each browser client (so it can hide controls it can't use), and
/// enforced authoritatively server-side in `ws.rs`.
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RemotePermissions {
    /// Whether a remote device may open new shells (the "+" button / `new`).
    pub allow_new_tab: bool,
    /// Whether a remote device may close / delete tabs (the "x" control).
    pub allow_close_tab: bool,
}

impl Default for RemotePermissions {
    /// Backward-compatible defaults: remote devices can open new shells (as
    /// before) but cannot close tabs (a brand-new capability, so opt-in).
    fn default() -> Self {
        Self {
            allow_new_tab: true,
            allow_close_tab: false,
        }
    }
}

/// Messages sent by the browser client over the WebSocket (JSON text frames).
/// All require the connection to have been approved first.
#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ClientMessage {
    /// Attach to (mirror) an existing session — i.e. switch tabs.
    Switch {
        #[serde(rename = "sessionId")]
        session_id: String,
        cols: u16,
        rows: u16,
    },
    /// Spawn a fresh dedicated shell and switch to it.
    New { cols: u16, rows: u16 },
    /// Close (kill) one of the desktop Terminal app's tabs. Honoured only when
    /// the host has granted close permission; routed to the app's own `closeTab`
    /// so the tab is truly removed (not left behind as a dead tab).
    CloseTab {
        #[serde(rename = "sessionId")]
        session_id: String,
    },
    /// Keyboard / paste input for the active session, base64-encoded.
    Input { data: String },
    /// Viewport resize. Honoured for the active session — dedicated shells and
    /// (per Option B) mirrored desktop tabs alike — so the shared PTY follows the
    /// remote viewer's dimensions and its `\r`-redraws line up on the phone.
    Resize { cols: u16, rows: u16 },
}

/// Messages sent by the server to the browser client (JSON text frames).
#[derive(Debug, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ServerMessage {
    /// Awaiting desktop approval.
    Pending,
    /// Rejected by the desktop (or approval timed out).
    Denied { reason: String },
    /// The current set of terminal tabs the client can attach to. Sent after
    /// approval and whenever the session set changes.
    Sessions { sessions: Vec<SessionInfo> },
    /// Now bridging this session — the client should clear + show it.
    Attached {
        #[serde(rename = "sessionId")]
        session_id: String,
        mode: SessionMode,
    },
    /// Raw PTY output of the active session, base64-encoded.
    Output { data: String },
    /// The given session ended.
    SessionExit {
        #[serde(rename = "sessionId")]
        session_id: String,
    },
    /// A recoverable error message for display.
    Error { message: String },
    /// Current host-granted permissions for tab management. Sent right after the
    /// first `Sessions` and again whenever the host toggles a permission, so the
    /// browser can show / hide its new-tab and close controls live.
    #[serde(rename_all = "camelCase")]
    Permissions {
        allow_new_tab: bool,
        allow_close_tab: bool,
    },
    /// Issued after approval so the browser can persist a trust grant and skip
    /// the approval prompt on reconnect (page reload) until it expires. Sent on a
    /// fresh approval and re-sent (with a slid-forward expiry) whenever an
    /// existing grant is reused, so the browser always holds the latest expiry.
    #[serde(rename_all = "camelCase")]
    Granted { grant: String, expires_at: i64 },
}

/// Payload of the `remote-terminal-approval-request` Tauri event: a new device
/// is waiting for the user to allow or deny terminal access. One approval grants
/// access to all tabs, so it is device-level (not tied to a session).
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApprovalRequestEvent {
    pub request_id: String,
    pub ip: String,
}

/// A connected remote device, surfaced in status + the clients-changed event.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientInfo {
    pub client_id: String,
    pub ip: String,
    /// Unix epoch milliseconds when the device connected.
    pub connected_at: i64,
}

/// Payload of the `remote-terminal-clients-changed` Tauri event.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientsChangedEvent {
    pub clients: Vec<ClientInfo>,
}

/// Payload of the `remote-terminal-close-tab` Tauri event: an approved remote
/// device asked to close one of the desktop Terminal app's tabs. The desktop
/// reacts by running its normal `closeTab` (kill PTY + remove tab + collapse
/// pane) so the removal is identical to a local close.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CloseTabEvent {
    pub session_id: String,
}

/// Payload of the `remote-terminal-new-tab` Tauri event: an approved remote
/// device asked to open a new tab. The desktop reacts by running its normal
/// `createTab` (spawn PTY + add tab + focus) — so the tab is a real, locally
/// visible Terminal app tab — then calls `cmd_remote_terminal_attach_new` with
/// the resulting session id so the waiting WebSocket bridge can attach the
/// requesting client to it. `request_id` correlates the reply to the waiting
/// `New` handler; `cols`/`rows` seed the new PTY to the phone's viewport.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NewTabEvent {
    pub request_id: String,
    pub cols: u16,
    pub rows: u16,
}

/// Payload of the `remote-terminal-mirror-size` Tauri event: a remote mirror
/// client started (or stopped) driving a shared desktop tab's PTY size (Option
/// B). While `controlled` is true, the desktop Terminal app resizes that tab's
/// xterm to `cols`x`rows` and suppresses its own fit-based resizing (so it can't
/// fight the phone); when false it reclaims its own dimensions. Only emitted for
/// mirror (shared) sessions — never for a connection's private dedicated shells.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MirrorSizeEvent {
    pub session_id: String,
    pub cols: u16,
    pub rows: u16,
    pub controlled: bool,
}

/// Returned by `cmd_remote_terminal_start`.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoteStartInfo {
    pub url: String,
    pub ip: String,
    pub port: u16,
    pub token: String,
}

/// Returned by `cmd_remote_terminal_status`.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoteStatus {
    pub running: bool,
    pub url: Option<String>,
    pub ip: Option<String>,
    pub port: Option<u16>,
    pub token: Option<String>,
    pub clients: Vec<ClientInfo>,
    /// Host-granted remote-device permissions (so the desktop UI can hydrate the
    /// toggle states, e.g. after a reload while sharing is already running).
    pub permissions: RemotePermissions,
}
