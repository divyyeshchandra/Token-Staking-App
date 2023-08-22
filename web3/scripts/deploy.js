const hre = require("hardhat");

async function main() {
  //STAKING CONTRACT
  const tokenStaking = await hre.ethers.deployContract("TokenStaking");

  await tokenStaking.waitForDeployment();

  //TOKEN CONTRACT
  const tokenContract = await hre.ethers.deployContract("Token");

  await tokenContract.waitForDeployment();

  //CONTRACT ADDRESS
  console.log(` STACKING: ${tokenStaking.target}`);
  console.log(` TOKEN: ${tokenContract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//  STACKING: 0x1230e2850538a2147b52f5da11c445fe3ff3427c;
//  TOKEN: 0x189429d9fa0331452eafc7d931536c4ce7e05f03;
