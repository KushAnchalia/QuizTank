import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers"; // Ensure proper import of ethers
import axios from "axios";
import { contractABI } from "../blockchain/quizContract.js";

const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function Quiz() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/quiz/${quizId}`)
      .then((res) => setQuiz(res.data))
      .catch((err) => console.error("Error fetching quiz", err));
  }, [quizId]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected! Please install MetaMask.");
      return;
    }
  
    try {
      // Force MetaMask to open account selection popup
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
  
      // Request accounts after permission is granted
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
  
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]); // Store the selected account
        alert(`Connected: ${accounts[0]}`);
      } else {
        alert("No account selected.");
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert(`Error: ${error.message || "Connection failed!"}`);
    }
  

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      console.log("Wallet address - ", address);


      setWalletAddress(address);
      console.log("Contract address - ", contractAddress);
      console.log("Contract ABI - ", contractABI);
      console.log("Signer - ", signer);
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log("Naaya Contract - ", contract);
      setContract(contract);

      console.log("Kush ka contract - ", contract);

      alert(`Connected to Wallet: ${address}`);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

console.log(contract);
  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers({ ...answers, [questionIndex]: selectedOption });
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    quiz.forEach((q, index) => {
      if (answers[index] === q.answer) {
        correctAnswers++;
      }
    });

    const calculatedScore = correctAnswers;
    setScore(calculatedScore);
    setRewardAmount((calculatedScore / quiz.length) * 0.1);
  };

  const distributeReward = async () => {
    if (!contract) {
      alert("Smart contract not initialized!");
      return;
    }
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    if (score === null) {
      alert("Please submit the quiz first to calculate the score.");
      return;
    }

    try {
      console.log(contract);
      console.log(contract.functions);
      
      // const tx = await contract.distributeRewards(walletAddress, score);
      const tx = await contract.distributeRewards(walletAddress, score);
      console.log(tx);
      await tx.wait();
      alert(`Rewards distributed successfully!`);
    } catch (error) {
      console.error("Transaction failed:", error);
      alert(`Transaction failed! ${error.reason || error.message}`);
    }
  };

  return (
    <div className="quiz-container">
      <h1>Quiz</h1>

      {!walletAddress ? (
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Connect Wallet
        </button>
      ) : (
        <p>Connected Wallet: {walletAddress}</p>
      )}

      {quiz ? (
        <div>
          {quiz.map((q, index) => (
            <div key={index} className="question-box">
              <h3>{q.question}</h3>
              {q.options.map((option, i) => (
                <p key={i}>
                  <input
                    type="radio"
                    name={`q${index}`}
                    value={option}
                    onChange={() => handleAnswerChange(index, option)}
                  />
                  {option}
                </p>
              ))}
            </div>
          ))}
          <button onClick={calculateScore} className="bg-gray-500 text-white px-4 py-2 rounded">
            Submit
          </button>

          {score !== null && (
            <div>
              <p>Your Score: {score} / {quiz.length}</p>
              <p>Reward Earned: {rewardAmount.toFixed(4)} ETH</p>
              <button
                onClick={distributeReward}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Claim Reward
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>Loading quiz...</p>
      )}
    </div>
  );
}

export default Quiz;
