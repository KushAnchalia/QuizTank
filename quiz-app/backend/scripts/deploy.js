const hre = require("hardhat");

async function main() {
  // Compile the contract if needed
  await hre.run("compile");

  // Deploy contract
  const QuizRewards = await hre.ethers.deployContract("QuizRewards");

  console.log("Deploying contract...");
  await QuizRewards.waitForDeployment();

  console.log("QuizRewards deployed to:", await QuizRewards.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
