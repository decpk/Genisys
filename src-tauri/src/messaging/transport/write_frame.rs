//! Write a single length-prefixed wire frame.

use tokio::io::{AsyncWrite, AsyncWriteExt};

use crate::messaging::types::MAX_FRAME_SIZE;

/// Writes a `u32` big-endian length prefix followed by the ciphertext bytes.
pub async fn write_frame<W: AsyncWrite + Unpin>(writer: &mut W, data: &[u8]) -> Result<(), String> {
    if data.len() > MAX_FRAME_SIZE {
        return Err(format!("frame size {} exceeds limit {MAX_FRAME_SIZE}", data.len()));
    }
    let len_buf = (data.len() as u32).to_be_bytes();
    writer.write_all(&len_buf).await.map_err(|e| e.to_string())?;
    writer.write_all(data).await.map_err(|e| e.to_string())?;
    writer.flush().await.map_err(|e| e.to_string())?;
    Ok(())
}
