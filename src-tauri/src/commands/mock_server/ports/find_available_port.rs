pub(crate) fn find_available_port(start: u16) -> Option<u16> {
    for port in start..=start.saturating_add(100) {
        if port == 0 {
            continue;
        }
        if std::net::TcpListener::bind(format!("127.0.0.1:{}", port)).is_ok() {
            return Some(port);
        }
    }
    None
}
