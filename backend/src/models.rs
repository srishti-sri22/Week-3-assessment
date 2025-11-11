use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub hash: String,
    pub from: String,
    pub to: String,
    pub value: String,
    #[serde(rename = "timeStamp")]
    pub timestamp: String,
    #[serde(rename = "blockNumber")]
    pub block_number: String,
    pub gas: String,
    #[serde(rename = "gasPrice")]
    pub gas_price: String,
    #[serde(rename = "gasUsed")]
    pub gas_used: String,
}

#[derive(Debug, Deserialize)]
pub struct EtherscanResponse {
    pub status: String,
    pub result: serde_json::Value,
}

#[derive(Debug, Serialize)]
pub struct BalanceResponse {
    pub address: String,
    pub balance_wei: String,
    pub balance_eth: String,
}

#[derive(Debug, Deserialize)]
pub struct PaginationQuery {
    pub page: Option<u32>,
    pub offset: Option<u32>,
}