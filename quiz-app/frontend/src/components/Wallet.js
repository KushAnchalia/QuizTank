import React, { useState } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI, rpcUrl } from "../config";

function Wallet({ setAccount }) {
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      setAccount(address);
    } else {
      alert("Install MetaMask to use this feature!");
    }
  };

  return (
    <div>
      <button onClick={connectWallet}>Connect MetaMask</button>
      {walletAddress && <p>Connected: {walletAddress}</p>}
    </div>
  );
}

export default Wallet;
