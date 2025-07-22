const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying VibeToken contract to Monad Testnet...");

  const VibeToken = await ethers.getContractFactory("VibeToken");
  const vibeToken = await VibeToken.deploy();

  await vibeToken.waitForDeployment();
  const contractAddress = await vibeToken.getAddress();

  console.log("VibeToken deployed to:", contractAddress);
  console.log("Transaction hash:", vibeToken.deploymentTransaction().hash);
  
  // 保存合约地址到配置文件
  const fs = require('fs');
  const config = {
    contractAddress: contractAddress,
    network: "monad-testnet",
    chainId: 10143
  };
  
  fs.writeFileSync('./src/config/contract.json', JSON.stringify(config, null, 2));
  console.log("Contract configuration saved to src/config/contract.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });