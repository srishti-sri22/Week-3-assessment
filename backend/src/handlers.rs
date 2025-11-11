use axum::{
    extract::{Path, Query, State},
    Json,
};
use std::sync::Arc;

use crate::config::AppState;
use crate::models::{BalanceResponse, EtherscanResponse, PaginationQuery, Transaction};
use crate::utils::{wei_to_eth, is_valid_ethereum_address};

pub async fn get_balance(
    State(state): State<Arc<AppState>>,
    Path(address): Path<String>,
) -> Json<BalanceResponse> {
    
    if !is_valid_ethereum_address(&address) {
        println!("Invalid address format: {}", address);
        return Json(BalanceResponse {
            address,
            balance_wei: "0".to_string(),
            balance_eth: "0.000000".to_string(),
        });
    }

    let url = format!(
        "https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address={}&tag=latest&apikey={}",
        address, state.api_key
    );

    println!("Fetching balance for: {}", address);

    if let Ok(resp) = state.http_client.get(&url).send().await {
        if let Ok(text) = resp.text().await {
            if let Ok(data) = serde_json::from_str::<EtherscanResponse>(&text) {
                if data.status == "1" {
                    let balance_wei = data.result.as_str().unwrap_or("0").to_string();
                    let balance_eth = wei_to_eth(&balance_wei);
                    
                    println!("Balance found: {} ETH", balance_eth);
                    
                    return Json(BalanceResponse {
                        address,
                        balance_wei,
                        balance_eth,
                    });
                }
                println!("Etherscan returned error");
            }
        }
    }

    println!("Failed to fetch balance");
    Json(BalanceResponse {
        address,
        balance_wei: "0".to_string(),
        balance_eth: "0.000000".to_string(),
    })
}

pub async fn get_transactions(
    State(state): State<Arc<AppState>>,
    Path(address): Path<String>,
    Query(params): Query<PaginationQuery>,
) -> Json<Vec<Transaction>> {
    
    if !is_valid_ethereum_address(&address) {
        println!("Invalid address format: {}", address);
        return Json(vec![]);
    }

    let page = params.page.unwrap_or(1);
    let offset = params.offset.unwrap_or(20);

    let url = format!(
        "https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address={}&startblock=0&endblock=99999999&page={}&offset={}&sort=desc&apikey={}",
        address, page, offset, state.api_key
    );

    println!("Fetching transactions for: {}", address);

    if let Ok(resp) = state.http_client.get(&url).send().await {
        if let Ok(text) = resp.text().await {
            if let Ok(data) = serde_json::from_str::<EtherscanResponse>(&text) {
                if data.status == "1" {
                    if let Ok(txs) = serde_json::from_value::<Vec<Transaction>>(data.result) {
                        println!("Found {} transactions", txs.len());
                        return Json(txs);
                    }
                }
            }
        }
    }

    println!("No transactions found");
    Json(vec![])
}

pub async fn get_internal_transactions(
    State(state): State<Arc<AppState>>,
    Path(address): Path<String>,
    Query(params): Query<PaginationQuery>,
) -> Json<Vec<Transaction>> {
    
    if !is_valid_ethereum_address(&address) {
        println!("Invalid address format: {}", address);
        return Json(vec![]);
    }

    let page = params.page.unwrap_or(1);
    let offset = params.offset.unwrap_or(20);

    let url = format!(
        "https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlistinternal&address={}&startblock=0&endblock=99999999&page={}&offset={}&sort=desc&apikey={}",
        address, page, offset, state.api_key
    );

    println!("📡Fetching internal transactions for: {}", address);

    if let Ok(resp) = state.http_client.get(&url).send().await {
        if let Ok(text) = resp.text().await {
            if let Ok(data) = serde_json::from_str::<EtherscanResponse>(&text) {
                if data.status == "1" {
                    if let Ok(txs) = serde_json::from_value::<Vec<Transaction>>(data.result) {
                        println!("Found {} internal transactions", txs.len());
                        return Json(txs);
                    }
                }
            }
        }
    }

    println!("No internal transactions found");
    Json(vec![])
}