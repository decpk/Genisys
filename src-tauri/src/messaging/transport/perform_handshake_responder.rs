//! Perform the Noise XX handshake as the responder (inbound connection).

use snow::TransportState;
use tokio::net::TcpStream;

use crate::messaging::transport::read_frame::read_frame;
use crate::messaging::transport::write_frame::write_frame;
use crate::messaging::types::{MAX_FRAME_SIZE, NOISE_PATTERN};

/// Mirror of the initiator: reads e, replies e,ee,s,es, reads s,se, then
/// transitions into transport mode. Returns transport state + remote pubkey.
pub async fn perform_handshake_responder(
    stream: &mut TcpStream,
    private_key: &[u8],
) -> Result<(TransportState, Vec<u8>), String> {
    let params = NOISE_PATTERN.parse().map_err(|e| format!("noise params: {e:?}"))?;
    let mut hs = snow::Builder::new(params)
        .local_private_key(private_key)
        .build_responder()
        .map_err(|e| e.to_string())?;

    let mut buf = vec![0u8; 65535];
    let mut payload = vec![0u8; 65535];

    // <- e
    let msg = read_frame(stream, MAX_FRAME_SIZE).await?;
    hs.read_message(&msg, &mut payload).map_err(|e| e.to_string())?;

    // -> e, ee, s, es
    let len = hs.write_message(&[], &mut buf).map_err(|e| e.to_string())?;
    write_frame(stream, &buf[..len]).await?;

    // <- s, se
    let msg = read_frame(stream, MAX_FRAME_SIZE).await?;
    hs.read_message(&msg, &mut payload).map_err(|e| e.to_string())?;

    let remote = hs
        .get_remote_static()
        .ok_or_else(|| "missing remote static key".to_string())?
        .to_vec();
    let transport = hs.into_transport_mode().map_err(|e| e.to_string())?;
    Ok((transport, remote))
}
