use std::env;

#[derive(Clone)]
pub struct AppState {
    pub api_key: String,
    pub http_client: reqwest::Client,
}

impl AppState {
    pub fn new() -> Self {
        dotenv::dotenv().ok();
        let api_key = env::var("ETHERSCAN_API_KEY").unwrap_or("YourApiKeyToken".to_string());
        Self {
            api_key,
            http_client: reqwest::Client::new(),
        }
    }
}
