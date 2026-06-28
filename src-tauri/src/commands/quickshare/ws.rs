//! WebSocket endpoint for QuickShare. Token-gated (validated before the upgrade;
//! no per-device approval — scanning the QR is the grant). Each socket receives
//! a `Welcome` snapshot, then a single loop fans broadcast tray/peer updates out
//! to the browser and accepts inbound text snippets from it.

use std::net::SocketAddr;

use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::{ConnectInfo, Query, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use futures_util::sink::SinkExt;
use futures_util::stream::{SplitSink, StreamExt};
use serde::Deserialize;
use tokio::sync::broadcast::error::RecvError;
use tokio::sync::watch;
use uuid::Uuid;

use super::events::{fan_out_clients, fan_out_tray};
use super::router::QuickCtx;
use super::state::Signal;
use super::types::{ClientInfo, ClientMessage, ServerMessage, TrayItem};

#[derive(Debug, Deserialize)]
pub struct WsQuery {
    #[serde(default)]
    pub token: String,
    /// Stable device id (browser-generated, persisted in localStorage).
    #[serde(default)]
    pub device: String,
    /// Friendly device name for the recipient picker.
    #[serde(default)]
    pub name: String,
}

type Tx = SplitSink<WebSocket, Message>;

/// axum handler for `GET /ws`. Rejects bad tokens before upgrading.
pub async fn ws_handler(
    ws: WebSocketUpgrade,
    Query(query): Query<WsQuery>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(ctx): State<QuickCtx>,
) -> Response {
    if !ctx.manager.validate_token(&query.token) {
        return (StatusCode::UNAUTHORIZED, "invalid or missing token").into_response();
    }
    ws.on_upgrade(move |socket| handle_socket(socket, addr, query, ctx))
}

async fn handle_socket(socket: WebSocket, addr: SocketAddr, query: WsQuery, ctx: QuickCtx) {
    let ip = addr.ip().to_string();
    let (mut ws_tx, mut ws_rx) = socket.split();

    // Per-connection id (manages this socket); the stable device id (shared by a
    // device's tabs / reconnects) drives recipient targeting and visibility.
    let client_id = Uuid::new_v4().to_string();
    let device_id = if query.device.trim().is_empty() {
        client_id.clone()
    } else {
        query.device.trim().to_string()
    };
    let name = {
        let n = query.name.trim();
        if n.is_empty() { ip.clone() } else { n.to_string() }
    };

    let (close_tx, mut close_rx) = watch::channel(false);
    // Subscribe before sending the welcome so no update is missed.
    let mut bcast = ctx.manager.subscribe();
    // Directed queue for messages aimed at this specific device (WebRTC
    // signaling relayed from a peer), separate from the broadcast fan-out.
    let (msg_tx, mut msg_rx) = tokio::sync::mpsc::unbounded_channel::<ServerMessage>();

    ctx.manager.register_client(
        ClientInfo {
            client_id: client_id.clone(),
            device_id: device_id.clone(),
            name: name.clone(),
            ip: ip.clone(),
            connected_at: chrono::Utc::now().timestamp_millis(),
        },
        close_tx,
        msg_tx,
    );

    // First frame: this device's id + the tray it may see + the peer list.
    let welcome = ServerMessage::Welcome {
        self_id: device_id.clone(),
        items: ctx.manager.snapshot_items_for(&device_id),
        clients: ctx.manager.snapshot_clients(),
    };
    if send_msg(&mut ws_tx, &welcome).await.is_err() {
        ctx.manager.unregister_client(&client_id);
        return;
    }

    // Tell everyone (and the desktop) that a peer joined.
    fan_out_clients(&ctx.app, &ctx.manager);

    loop {
        tokio::select! {
            _ = close_rx.changed() => break,

            // A message aimed at this device (relayed WebRTC signaling). Closed
            // sender => the half is gone; ignore and keep serving the socket.
            directed = msg_rx.recv() => {
                if let Some(msg) = directed {
                    if send_msg(&mut ws_tx, &msg).await.is_err() {
                        break;
                    }
                }
            }

            signal = bcast.recv() => match signal {
                Ok(Signal::Tray) => {
                    let msg = ServerMessage::Tray {
                        items: ctx.manager.snapshot_items_for(&device_id),
                    };
                    if send_msg(&mut ws_tx, &msg).await.is_err() {
                        break;
                    }
                }
                Ok(Signal::Clients) => {
                    let msg = ServerMessage::Clients {
                        clients: ctx.manager.snapshot_clients(),
                    };
                    if send_msg(&mut ws_tx, &msg).await.is_err() {
                        break;
                    }
                }
                // Dropped some signals: resync both views so nothing is stale.
                Err(RecvError::Lagged(_)) => {
                    let tray = ServerMessage::Tray {
                        items: ctx.manager.snapshot_items_for(&device_id),
                    };
                    let peers = ServerMessage::Clients {
                        clients: ctx.manager.snapshot_clients(),
                    };
                    if send_msg(&mut ws_tx, &tray).await.is_err()
                        || send_msg(&mut ws_tx, &peers).await.is_err()
                    {
                        break;
                    }
                }
                Err(RecvError::Closed) => break,
            },

            incoming = ws_rx.next() => match incoming {
                Some(Ok(Message::Text(text))) => {
                    match serde_json::from_str::<ClientMessage>(&text) {
                        Ok(ClientMessage::SendText { text, target }) => {
                            let trimmed = text.trim();
                            if !trimmed.is_empty() {
                                let item = TrayItem::new_text(
                                    trimmed.to_string(),
                                    name.clone(),
                                    device_id.clone(),
                                    target,
                                );
                                ctx.manager.add_item(item);
                                fan_out_tray(&ctx.app, &ctx.manager);
                            }
                        }
                        // Forward an opaque WebRTC signaling blob to the target
                        // device, stamped with this peer's id so it can reply.
                        Ok(ClientMessage::Signal { to, data }) => {
                            ctx.manager.send_to_device(
                                &to,
                                ServerMessage::Signal {
                                    from: device_id.clone(),
                                    data,
                                },
                            );
                        }
                        Err(_) => {}
                    }
                }
                Some(Ok(Message::Close(_))) | None => break,
                Some(Ok(_)) => {}
                Some(Err(_)) => break,
            },
        }
    }

    ctx.manager.unregister_client(&client_id);
    fan_out_clients(&ctx.app, &ctx.manager);
}

async fn send_msg(ws_tx: &mut Tx, msg: &ServerMessage) -> Result<(), axum::Error> {
    let text =
        serde_json::to_string(msg).unwrap_or_else(|_| String::from(r#"{"type":"error"}"#));
    ws_tx.send(Message::Text(text)).await
}
