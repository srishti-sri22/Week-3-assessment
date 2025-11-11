mod config;
mod handlers;
mod models;
mod utils;

use axum::{
    http::{HeaderValue, Method},
    routing::get,
    Router,
};
use tower_http::cors::CorsLayer;

use config::AppState;
use handlers::{get_balance, get_internal_transactions, get_transactions};

#[tokio::main]
async fn main() {
    let state = AppState::new();

    let cors = CorsLayer::new()
        .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET]);

    let app = Router::new()
        .route("/api/balance/:address", get(get_balance))
        .route("/api/transactions/:address", get(get_transactions))
        .route("/api/internal-transactions/:address", get(get_internal_transactions))
        .layer(cors)
        .with_state(state.into());

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .unwrap();

    println!("Server running on http://127.0.0.1:8080");
    println!("Ready to accept requests!");
    
    axum::serve(listener, app).await.unwrap();
}