module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deployer } = await getNamedAccounts();

  const TierSystem = require("../contracts/artifacts/TierSystem.json");

  const vipDisAmount = ethers.utils.parseEther("100");
  const vipPercent = 100;
  const holdersDisAmount = ethers.utils.parseEther("10");
  const holdersPercent = 25;
  const publicDisAmount = ethers.utils.parseEther("0.001");
  const publicPercent = 10;

  const tierSystemFactory = await ethers.getContractFactory(TierSystem.abi, TierSystem.bytecode);
  tierSystem = await tierSystemFactory.deploy(
    vipDisAmount,
    vipPercent,
    holdersDisAmount,
    holdersPercent,
    publicDisAmount,
    publicPercent
  );
  let tierSystemContract = await tierSystem.deployed();
  console.log("TierSystem address ====> " + tierSystemContract.address);
};

module.exports.tags = ["TierSystem"];
