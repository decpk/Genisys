/**
 * Label of the primary application window declared in
 * `src-tauri/tauri.conf.json`. Every other Tauri window — detached app
 * pop-outs (`app-*`), debug panel (`debug`), time machine (`timemachine`,
 * `prtimemachine`), and the timer focus mini (`timer-focus`) — is created
 * with a distinct label and treated as a "secondary" window.
 *
 * Window-scoped behavior (quit confirmation, app-level shortcuts, etc.)
 * keys off this constant rather than URL sniffing so it stays correct
 * regardless of routing or query params.
 */
export const MAIN_WINDOW_LABEL = 'main'
