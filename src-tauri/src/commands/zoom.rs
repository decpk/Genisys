mod get_zoom_level;
mod zoom_in;
mod zoom_out;
mod zoom_reset;

pub use get_zoom_level::*;
pub use zoom_in::*;
pub use zoom_out::*;
pub use zoom_reset::*;

use std::sync::atomic::AtomicI32;

pub(crate) static ZOOM_LEVEL: AtomicI32 = AtomicI32::new(0);
