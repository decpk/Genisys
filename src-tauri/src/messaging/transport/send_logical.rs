//! Encrypt and send one logical application message over the Noise transport.

use tokio::io::{AsyncWrite, AsyncWriteExt};

use crate::messaging::transport::write_frame::write_frame;
use crate::messaging::types::{SharedTransport, NOISE_MAX_PAYLOAD};

/// Sends `plaintext` as a logical message. Because a single Noise transport
/// message is capped at 65535 bytes, the payload is prefixed with a 4-byte
/// big-endian total length and split into Noise-sized chunks; each chunk is
/// encrypted (lock held only for the encrypt) and written as its own frame.
pub async fn send_logical<W: AsyncWrite + Unpin>(
    transport: &SharedTransport,
    writer: &mut W,
    plaintext: &[u8],
) -> Result<(), String> {
    let mut framed = Vec::with_capacity(plaintext.len() + 4);
    framed.extend_from_slice(&(plaintext.len() as u32).to_be_bytes());
    framed.extend_from_slice(plaintext);

    for chunk in framed.chunks(NOISE_MAX_PAYLOAD) {
        let mut buf = vec![0u8; chunk.len() + 16];
        let len = {
            let mut ts = transport.lock().await;
            ts.write_message(chunk, &mut buf).map_err(|e| e.to_string())?
        };
        write_frame(writer, &buf[..len]).await?;
    }
    writer.flush().await.map_err(|e| e.to_string())?;
    Ok(())
}
