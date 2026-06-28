//! Receive and decrypt one logical application message from the Noise transport.

use tokio::io::AsyncRead;

use crate::messaging::transport::read_frame::read_frame;
use crate::messaging::types::{SharedTransport, MAX_FRAME_SIZE};

/// Reads encrypted frames, decrypts each chunk (lock held only for the
/// decrypt — never across a socket await), and reassembles the logical message
/// using the 4-byte big-endian length prefix written by `send_logical`.
pub async fn recv_logical<R: AsyncRead + Unpin>(
    transport: &SharedTransport,
    reader: &mut R,
    max_logical: usize,
) -> Result<Vec<u8>, String> {
    let mut assembled: Vec<u8> = Vec::new();
    let mut total: Option<usize> = None;

    loop {
        let ciphertext = read_frame(reader, MAX_FRAME_SIZE).await?;
        let mut plain = vec![0u8; ciphertext.len()];
        let len = {
            let mut ts = transport.lock().await;
            ts.read_message(&ciphertext, &mut plain).map_err(|e| e.to_string())?
        };
        assembled.extend_from_slice(&plain[..len]);

        if total.is_none() && assembled.len() >= 4 {
            let declared = u32::from_be_bytes([assembled[0], assembled[1], assembled[2], assembled[3]]) as usize;
            if declared > max_logical {
                return Err(format!("logical message {declared} exceeds limit {max_logical}"));
            }
            total = Some(declared);
        }

        if let Some(declared) = total {
            if assembled.len() >= declared + 4 {
                return Ok(assembled[4..declared + 4].to_vec());
            }
        }
    }
}
