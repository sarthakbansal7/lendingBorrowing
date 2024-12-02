import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  Copy,
  PiggyBank,
  TrendingUp,
  History,
  Wallet,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Search,
  X,
} from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import { useWeb3 } from "../context/useWeb3";
import axios from "axios";
import { backendDomain } from "../constant/domain";
import RenderModal from "../components/Models/modal";
import { formatEther } from "ethers";
import { depositEther, withdrawEther } from "../blockchain/scripts/Lending";

const assets = [
  {
    symbol: "ETH",
    name: "Ethereum",
    lendingRate: "3.5%",
    borrowingRate: "5.2%",
    totalSupply: "1,234.56 ETH",
    totalBorrowed: "789.12 ETH",
    walletBalance: "2.5 ETH",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    lendingRate: "8.2%",
    borrowingRate: "10.5%",
    totalSupply: "2,500,000 USDC",
    totalBorrowed: "1,800,000 USDC",
    walletBalance: "5,000 USDC",
  },
  {
    symbol: "DAI",
    name: "Dai",
    lendingRate: "7.8%",
    borrowingRate: "9.8%",
    totalSupply: "1,800,000 DAI",
    totalBorrowed: "1,200,000 DAI",
    walletBalance: "3,000 DAI",
  },
];

const lendingTHead = [
  "Date & Time",
  "Asset",
  "Type",
  "Amount",
  "Interest Gain",
  "Action",
];
const borrowTHead = [
  "Date & Time",
  "Asset",
  "Type",
  "Collateral Amount",
  "Borrow Amount",
  "Action",
];

const lendingPanel = [
  "Asset",
  "Lending APY",
  "Borrowing APY",
  "Account",
  "Balance (ETH)",
  "Input Amount",
  "Actions",
];

const borrowingPanel = [
  "Asset",
  "Lending APY",
  "Borrowing APY",
  "Available ETH",
  "Collateral Amount (10%)",
  "Actions",
];

export default function LendingPage() {
  
  const [activeTab, setActiveTab] = useState("lend");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const { provider, signer, account, balance } = useWeb3();
  const [lendingHistory, setLendingHistory] = useState([]);
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [lendingModal, setLendingModal] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [inputValue1, setInputValue1] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [activeTabT, setActiveTabT] = useState("lend");

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const totalAssestLent = () => {
    return lendingHistory.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0
    );
  };

  const totalAssestborrow = () => {
    return borrowingHistory.reduce(
      (sum, item) => sum + parseFloat(item.borrowAmount),
      0
    );
  };

  const getBorrowingHistory = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${backendDomain}/borrowing`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setBorrowingHistory(response.data.response);
  };

  const getLendingHistory = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${backendDomain}/lending`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setLendingHistory(response.data.data);
  };

  const lendToEmployer = async (amount) => {
    const token = localStorage.getItem("token");

    await axios.post(
      `${backendDomain}/lending`,
      {
        amount,
        status: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await depositEther(signer, amount);
    window.location.reload();
  };

  const borrowToEmployer = async (
    borrowAmount,
    collateralAmount,
    lendingId
  ) => {
    const token = localStorage.getItem("token");

    await axios.post(
      `${backendDomain}/borrowing`,
      {
        borrowAmount,
        collateralAmount,
        lendingId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await depositEther(signer, Number(borrowAmount) + Number(collateralAmount));
    window.location.reload();
  };

  const withdrawT = async (id, amount) => {
    const token = localStorage.getItem("token");
    await axios.post(
      `${backendDomain}/lending/withdraw`,
      { id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await withdrawEther(signer, amount);
    window.location.reload();
  };

  const repayT = async (id, borrowAmount) => {
    const token = localStorage.getItem("token");
    await axios.post(
      `${backendDomain}/borrowing/repay`,
      { id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await depositEther(signer, borrowAmount);
    window.location.reload();
  };

  const withdrawCollateral = async (borrowId, lendingId, amount) => {
    const token = localStorage.getItem("token");
    await axios.post(
      `${backendDomain}/borrowing/withdraw`,
      { borrowId, lendingId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await withdrawEther(signer, amount)
    window.location.reload();
  };

  useEffect(() => {
    getBorrowingHistory();
    getLendingHistory();
  }, []);

  if (activeModal) {
    return (
      <RenderModal
        activeModal={activeModal}
        setActiveModal={setActiveModal}
      ></RenderModal>
    );
  }
  function truncateAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.write(text);
  };
  
  const totalAssetsLent = () => {
    return lendingHistory.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  };

  const totalAssetsBorrowed = () => {
    return borrowingHistory.reduce((sum, item) => sum + parseFloat(item.borrowAmount), 0);
  };
    
    // Sample transaction data
    const lendingHistoryT = [
      {
        _id: "1",
        date: "2024-03-15 14:30",
        amount: 2.5,
        status: true
      },
      {
        _id: "2",
        date: "2024-03-14 09:15",
        amount: 1.8,
        status: false
      }
    ];
  
    const borrowingHistoryT = [
      {
        _id: "3",
        date: "2024-03-15 16:45",
        amount: 1.2,
        status: true
      },
      {
        _id: "4",
        date: "2024-03-13 11:20",
        amount: 3.0,
        status: false
      }
    ];
  
    const withdraw = (id, amount) => {
      console.log(`Withdrawing ${amount} ETH from transaction ${id}`);
    };
  
    const repay = (id, amount) => {
      console.log(`Repaying ${amount} ETH for transaction ${id}`);
    };
  return (
    <div className="min-h-screen bg-crypto-dark text-white p-4">
      {/* Back Button */}
      <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4">
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="max-w-full mx-auto space-y-4">
        {/* Hero Section */}
        <div className="bg-crypto-card border border-gray-800 rounded-xl p-4 hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Lend & Borrow Seamlessly
              </h1>
              <p className="text-gray-400 mt-2">
                Put your assets to work or access funds instantly, powered by blockchain
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-crypto-dark rounded-xl p-4 border border-gray-800">
            <div className="flex items-center space-x-3 mb-2">
              <PiggyBank className="w-5 h-5 text-indigo-400" />
              <span className="text-gray-400">Total Assets Lent</span>
            </div>
            <div className="text-2xl font-bold">{totalAssetsLent()} ETH</div>
            <div className="text-green-400 text-sm">+12.5% this month</div>
          </div>

          <div className="bg-crypto-dark rounded-xl p-4 border border-gray-800">
            <div className="flex items-center space-x-3 mb-2">
              <Wallet className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400">Total Assets Borrowed</span>
            </div>
            <div className="text-2xl font-bold">{totalAssetsBorrowed()} ETH</div>
            <div className="text-red-400 text-sm">-5.2% this month</div>
          </div>

          <div className="bg-crypto-dark rounded-xl p-4 border border-gray-800">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-gray-400">Total Interest Earned</span>
            </div>
            <div className="text-2xl font-bold">$3,250</div>
            <div className="text-green-400 text-sm">+8.3% this month</div>
          </div>
        </div>

        {/* Main Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Lending Panel */}
          <div className="bg-crypto-card border border-gray-800 rounded-xl p-4 hover:border-indigo-500/50 transition-all">
            <h2 className="text-xl font-bold mb-4">Lending</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-crypto-dark/90 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Asset</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Lending APY</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Input Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="group hover:bg-crypto-dark/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                          E
                        </div>
                        <div>
                          <div className="font-semibold">Ethereum</div>
                          <div className="text-sm text-gray-400">ETH</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-green-400">3.2%</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="text"
                        placeholder="Amount"
                        value={inputValue1}
                        onChange={(e) => setInputValue1(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-crypto-dark border border-gray-800 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all">
                          Lend
                        </button>
                        <button className="px-4 py-2 rounded-lg border border-gray-700 hover:border-indigo-500 transition-all">
                          Withdraw
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Borrowing Panel */}
          <div className="bg-crypto-card border border-gray-800 rounded-xl p-4 hover:border-indigo-500/50 transition-all">
            <h2 className="text-xl font-bold mb-4">Borrowing</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-crypto-dark/90 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Asset</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Lending APY</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Input Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="group hover:bg-crypto-dark/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                          E
                        </div>
                        <div>
                          <div className="font-semibold">Ethereum</div>
                          <div className="text-sm text-gray-400">ETH</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-green-400">3.2%</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="text"
                        placeholder="Amount"
                        value={inputValue2}
                        onChange={(e) => setInputValue2(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-crypto-dark border border-gray-800 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all">
                          Borrow
                        </button>
                        <button className="px-4 py-2 rounded-lg border border-gray-700 hover:border-indigo-500 transition-all">
                          Repay
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Lending Portfolio */}
          <div className="bg-crypto-card border border-gray-800 rounded-xl p-4 hover:border-indigo-500/50 transition-all">
            <h3 className="text-xl font-bold mb-4">Your Lending Portfolio</h3>
            <div className="space-y-4">
              <div className="bg-crypto-dark rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Total Value Locked</span>
                  <span className="font-bold">$50,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Interest Earned</span>
                  <span className="text-green-400">$1,250</span>
                </div>
              </div>
            </div>
          </div>

          {/* Borrowing Portfolio */}
          <div className="bg-crypto-card border border-gray-800 rounded-xl p-4 hover:border-indigo-500/50 transition-all">
            <h3 className="text-xl font-bold mb-4">Your Borrowing Portfolio</h3>
            <div className="space-y-4">
              <div className="bg-crypto-dark rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Total Debt</span>
                  <span className="font-bold">$25,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Interest Owed</span>
                  <span className="text-red-400">$450</span>
                </div>
              </div>
              <div className="bg-crypto-dark rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Health Factor</span>
                  <span className="text-green-400">1.85</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-gradient-to-r from-green-600 to-emerald-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-crypto-card border border-gray-800 rounded-xl p-4 hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Transaction History</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTabT("lend")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTabT === "lend"
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Lending
              </button>
              <button
                onClick={() => setActiveTabT("borrow")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTabT === "borrow"
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Borrowing
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-crypto-dark/90 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date & Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Asset</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Interest</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {activeTabT === "lend" && lendingHistoryT.map((item) => (
                  <tr key={item._id} className="group hover:bg-crypto-dark/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">{item.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">ETH</td>
                    <td className="px-4 py-3 whitespace-nowrap text-indigo-400">{activeTabT}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.amount} ETH</td>
                    <td className="px-4 py-3 whitespace-nowrap">{(item.amount * 0.1).toFixed(2)} ETH</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.status ? (
                        <button 
                          onClick={() => withdrawT(item._id, item.amount)} 
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
                        >
                          Withdraw
                        </button>
                      ) : (
                        <span className="text-gray-500">Can't Withdraw</span>
                      )}
                    </td>
                  </tr>
                ))}
                {activeTabT === "borrow" && borrowingHistoryT.map((item) => (
                  <tr key={item._id} className="group hover:bg-crypto-dark/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">{item.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">ETH</td>
                    <td className="px-4 py-3 whitespace-nowrap text-red-400">{activeTabT}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.amount} ETH</td>
                    <td className="px-4 py-3 whitespace-nowrap">{(item.amount * 0.12).toFixed(2)} ETH</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.status ? (
                        <button 
                          onClick={() => repayT(item._id, item.amount)} 
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-lg hover:shadow-red-500/20 transition-all"
                        >
                          Repay
                        </button>
                      ) : (
                        <span className="text-gray-500">Repaid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  
  );
};

