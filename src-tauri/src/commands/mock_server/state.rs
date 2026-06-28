use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct ServerHandle {
    pub shutdown_tx: Option<tokio::sync::oneshot::Sender<()>>,
    pub port: u16,
    pub server_name: String,
}

pub struct MockServerState {
    pub servers: Arc<Mutex<HashMap<String, ServerHandle>>>,
}

impl MockServerState {
    pub fn new() -> Self {
        Self {
            servers: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}
