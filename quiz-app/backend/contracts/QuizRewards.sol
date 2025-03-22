// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract QuizRewards {
    address public owner;
    uint256 public ownerBalance;
    mapping(address => uint256) public rewards;

    event Staked(address indexed owner, uint256 amount);
    event RewardDistributed(address indexed quizTaker, uint256 amount);
    event RewardClaimed(address indexed quizTaker, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Owner stakes funds into the contract
    function stake() external payable onlyOwner {
        require(msg.value > 0, "Must stake ETH");
        ownerBalance += msg.value;
        emit Staked(msg.sender, msg.value);
    }

    // Distribute rewards to the quiz taker based on score
    function distributeRewards(address quizTaker, uint256 score) external onlyOwner {
        require(ownerBalance > 0, "No funds available");
        uint256 rewardAmount = (ownerBalance * score) / 10; // 10% of owner's balance based on score
        require(rewardAmount <= ownerBalance, "Not enough balance");

        ownerBalance -= rewardAmount; // Deduct from owner's balance
        rewards[quizTaker] += rewardAmount; // Add to quiz taker's rewards

        emit RewardDistributed(quizTaker, rewardAmount);
    }

    // Quiz taker claims their reward
    function claimReward() external {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards to claim");

        rewards[msg.sender] = 0;
        payable(msg.sender).transfer(reward);

        emit RewardClaimed(msg.sender, reward);
    }

    // Allow owner to withdraw unused funds
    function withdrawFunds(uint256 amount) external onlyOwner {
        require(amount <= ownerBalance, "Not enough funds");
        ownerBalance -= amount;
        payable(owner).transfer(amount);
    }

    // Check contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
