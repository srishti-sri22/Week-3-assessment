pub fn wei_to_eth(wei: &str) -> String {
    let wei_value: f64 = wei.parse().unwrap_or(0.0);
    let eth_value = wei_value / 1e18;
    format!("{:.6}", eth_value)
}

pub fn is_valid_ethereum_address(address: &str) -> bool {
    return address.starts_with("0x") && address.len() == 42;
}