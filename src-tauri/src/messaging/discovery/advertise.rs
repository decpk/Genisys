//! Advertise this instance on the LAN via mDNS.

use std::collections::HashMap;

use mdns_sd::{ServiceDaemon, ServiceInfo};

use crate::messaging::types::SERVICE_TYPE;

/// Registers a `_genisys-msg._tcp.local.` service with TXT properties
/// `pk` (base64 public key) and `dn` (display name). Uses `enable_addr_auto`
/// so the daemon fills in this host's LAN addresses automatically.
pub fn advertise(
    daemon: &ServiceDaemon,
    instance: &str,
    port: u16,
    public_key_b64: &str,
    display_name: &str,
) -> Result<(), String> {
    let host_name = format!("{instance}.local.");
    let mut props: HashMap<String, String> = HashMap::new();
    props.insert("pk".to_string(), public_key_b64.to_string());
    props.insert("dn".to_string(), display_name.to_string());

    let info = ServiceInfo::new(SERVICE_TYPE, instance, &host_name, "", port, props)
        .map_err(|e| e.to_string())?
        .enable_addr_auto();
    daemon.register(info).map_err(|e| e.to_string())?;
    Ok(())
}
