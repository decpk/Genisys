//! Best-effort detection of this machine's primary LAN IPv4 address — the
//! address another peer on the same network can use to reach us via the
//! manual `host:port` connect flow.
//!
//! Dependency-free: we open a UDP socket and "connect" it to an off-box
//! address. UDP connect sends no packets; it only makes the OS pick the
//! source address from the routing table, which is exactly the outbound LAN
//! IP we want. Works offline too as long as a default/LAN route exists.

use std::net::{IpAddr, UdpSocket};

/// Returns the primary non-loopback IPv4 address as a string (e.g.
/// `"192.168.1.42"`), or `None` when it cannot be determined.
pub fn detect_local_ip() -> Option<String> {
    // Try a public target first (picks the default-route interface), then a
    // private-range target as a fallback for LAN-only / offline machines.
    for target in ["8.8.8.8:80", "192.168.0.1:80", "10.0.0.1:80"] {
        if let Some(ip) = probe_source_ip(target) {
            return Some(ip);
        }
    }
    None
}

fn probe_source_ip(target: &str) -> Option<String> {
    let socket = UdpSocket::bind("0.0.0.0:0").ok()?;
    socket.connect(target).ok()?;
    match socket.local_addr().ok()?.ip() {
        IpAddr::V4(v4) if !v4.is_loopback() && !v4.is_unspecified() => Some(v4.to_string()),
        _ => None,
    }
}
