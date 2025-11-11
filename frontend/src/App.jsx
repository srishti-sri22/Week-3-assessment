import React, { useState } from 'react';
import { Search, Wallet, ArrowUpDown, Clock } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8080/api';

export default function EtherscanViewer() {
  const [addressInput, setAddressInput] = useState('');
  const [searchedAddress, setSearchedAddress] = useState('');
  const [balance, setBalance] = useState(null);
  const [activeTab, setActiveTab] = useState('balance');
  const [transactions, setTransactions] = useState([]);
  const [internalTxs, setInternalTxs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  };

  const weiToEth = (wei) => {
    const ethValue = parseInt(wei) / 1e18;
    return ethValue.toFixed(6);
  };

  const fetchBalance = async (address) => {
    try {
      const response = await fetch(`${API_URL}/balance/${address}`);
      const data = await response.json();
      console.log("Raw API data:", data);
      setBalance(data);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setError('Failed to fetch balance');
    }
  };

  const fetchTransactions = async (address) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${address}?offset=20`);
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to fetch transactions');
    }
  };

  const fetchInternalTxs = async (address) => {
    try {
      const response = await fetch(`${API_URL}/internal-transactions/${address}?offset=20`);
      const data = await response.json();
      setInternalTxs(data);
    } catch (err) {
      console.error('Failed to fetch internal transactions:', err);
      setError('Failed to fetch internal transactions');
    }
  };

  const handleSearch = async () => {
    if (!addressInput) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError('');
    setSearchedAddress(addressInput);

    await Promise.all([
      fetchBalance(addressInput),
      fetchTransactions(addressInput),
      fetchInternalTxs(addressInput),
    ]);

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔍 Wallet Explorer
          </h1>
          <p className="text-gray-300">
            Enter your Ethereum address to view balance and transactions
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Ethereum address (0x...)"
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Search size={20} />
              Search
            </button>
          </div>
          
          {error && (
            <div className="mt-2 text-red-400 text-sm">{error}</div>
          )}
        </div>

        {balance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="text-purple-400" size={24} />
                <h3 className="text-gray-400 text-sm font-medium">Balance</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {balance.balance_eth} ETH
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <ArrowUpDown className="text-green-400" size={24} />
                <h3 className="text-gray-400 text-sm font-medium">Transactions</h3>
              </div>
              <p className="text-2xl font-bold text-white">{transactions.length}</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="text-blue-400" size={24} />
                <h3 className="text-gray-400 text-sm font-medium">Internal Txs</h3>
              </div>
              <p className="text-2xl font-bold text-white">{internalTxs.length}</p>
            </div>
          </div>
        )}

        {searchedAddress && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            
            <div className="flex border-b border-slate-700">
              <button
                onClick={() => setActiveTab('balance')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'balance'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Balance Details
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'transactions'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('internal')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'internal'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Internal Transactions
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                  <p className="text-gray-400 mt-4">Loading data...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'balance' && balance && (
                    <div className="space-y-4">
                      <div className="bg-slate-900 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Address</p>
                        <p className="text-white font-mono break-all">{balance.address}</p>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Balance (Wei)</p>
                        <p className="text-white font-mono">{balance.balance_wei}</p>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Balance (ETH)</p>
                        <p className="text-white text-3xl font-bold">{balance.balance_eth} ETH</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'transactions' && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-400 text-sm border-b border-slate-700">
                            <th className="pb-3 font-medium">Hash</th>
                            <th className="pb-3 font-medium">From</th>
                            <th className="pb-3 font-medium">To</th>
                            <th className="pb-3 font-medium">Value (ETH)</th>
                            <th className="pb-3 font-medium">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((tx, index) => (
                            <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/50">
                              <td className="py-3 text-purple-400 font-mono text-sm">
                                {shortenAddress(tx.hash)}
                              </td>
                              <td className="py-3 text-gray-300 font-mono text-sm">
                                {shortenAddress(tx.from)}
                              </td>
                              <td className="py-3 text-gray-300 font-mono text-sm">
                                {shortenAddress(tx.to)}
                              </td>
                              <td className="py-3 text-white font-medium">
                                {weiToEth(tx.value)}
                              </td>
                              <td className="py-3 text-gray-400 text-sm">
                                {formatDate(tx.timestamp)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {transactions.length === 0 && (
                        <p className="text-center text-gray-400 py-8">
                          No transactions found for this address
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === 'internal' && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-400 text-sm border-b border-slate-700">
                            <th className="pb-3 font-medium">Hash</th>
                            <th className="pb-3 font-medium">From</th>
                            <th className="pb-3 font-medium">To</th>
                            <th className="pb-3 font-medium">Value (ETH)</th>
                            <th className="pb-3 font-medium">Block</th>
                          </tr>
                        </thead>
                        <tbody>
                          {internalTxs.map((tx, index) => (
                            <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/50">
                              <td className="py-3 text-purple-400 font-mono text-sm">
                                {shortenAddress(tx.hash)}
                              </td>
                              <td className="py-3 text-gray-300 font-mono text-sm">
                                {shortenAddress(tx.from)}
                              </td>
                              <td className="py-3 text-gray-300 font-mono text-sm">
                                {shortenAddress(tx.to)}
                              </td>
                              <td className="py-3 text-white font-medium">
                                {weiToEth(tx.value)}
                              </td>
                              <td className="py-3 text-gray-400 text-sm">
                                {tx.block_number}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {internalTxs.length === 0 && (
                        <p className="text-center text-gray-400 py-8">
                          No internal transactions found for this address
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {!searchedAddress && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              👆 Enter an Ethereum address above to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}