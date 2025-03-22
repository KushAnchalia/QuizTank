import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
  const [topic, setTopic] = useState("");
  const [quizId, setQuizId] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakedBalance, setStakedBalance] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected! Please install MetaMask.");
      return;
    }
    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        alert(`Connected: ${accounts[0]}`);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert(`Error: ${error.message || "Connection failed!"}`);
    }
  };

  const stakeMoney = async () => {
    if (!walletAddress) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!stakeAmount || isNaN(stakeAmount) || stakeAmount <= 0) {
      setError("Enter a valid stake amount.");
      return;
    }
    try {
      const tx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: walletAddress,
            to: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
            value: (stakeAmount * 1e18).toString(16),
          },
        ],
      });
      console.log("Transaction Hash:", tx);
      setStakedBalance(stakedBalance + parseFloat(stakeAmount));
      setError(null);
    } catch (error) {
      console.error("Transaction failed:", error);
      setError("Transaction failed. Try again.");
    }
  };

  const generateQuiz = async () => {
    if (!walletAddress) {
      setError("Please connect your wallet first.");
      return;
    }
    if (stakedBalance <= 0) {
      setError("You must stake some ETH before generating a quiz.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/create-quiz", { topic });
      if (response.data.success) {
        setQuizId(response.data.quizId);
        setError(null);
      } else {
        setError("Failed to generate quiz. Please try again.");
      }
    } catch (error) {
      console.error("Error generating quiz", error);
      setError("Internal Server Error");
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-2xl font-bold">Quiz Generator</h1>
      {!walletAddress ? (
        <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 rounded">
          Connect Wallet
        </button>
      ) : (
        <p className="bg-green-500 text-white px-4 py-2 rounded">
          Connected: {walletAddress}
        </p>
      )}
      <input
        type="text"
        value={stakeAmount}
        onChange={(e) => setStakeAmount(e.target.value)}
        placeholder="Enter stake amount (ETH)"
        className="border rounded px-2 py-1"
      />
      <button onClick={stakeMoney} className="bg-yellow-500 text-white px-4 py-2 rounded">
        Stake Money
      </button>
      <p>Staked Balance: {stakedBalance} ETH</p>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter quiz topic"
        className="border rounded px-2 py-1"
      />
      <button onClick={generateQuiz} className="bg-purple-500 text-white px-4 py-2 rounded">
        Generate Quiz
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {quizId && (
        <p>
          Quiz created! <a href={`/quiz/${quizId}`} className="text-blue-500 underline">Click here to attempt</a>
        </p>
      )}
    </div>
  );
}

export default App;
