//! Read a single length-prefixed wire frame.

use tokio::io::{AsyncRead, AsyncReadExt};

/// Reads a `u32` big-endian length prefix followed by that many ciphertext
/// bytes. Rejects zero-length and oversized frames to guard against
/// memory-exhaustion DoS.
pub async fn read_frame<R: AsyncRead + Unpin>(reader: &mut R, max: usize) -> Result<Vec<u8>, String> {
    let mut len_buf = [0u8; 4];
    reader.read_exact(&mut len_buf).await.map_err(|e| e.to_string())?;
    let len = u32::from_be_bytes(len_buf) as usize;
    if len == 0 || len > max {
        return Err(format!("frame size {len} out of bounds (max {max})"));
    }
    let mut buf = vec![0u8; len];
    reader.read_exact(&mut buf).await.map_err(|e| e.to_string())?;
    Ok(buf)
}
