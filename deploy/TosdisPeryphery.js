module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const TierSystem = require("../contracts/artifacts/TierSystem.json");
  const IDOCreator = require("../contracts/artifacts/IDOCreator.json");
  const IDOMaster = require("../contracts/artifacts/IDOMaster.json");

  const feeAmount = ethers.utils.parseEther("0");
  const feeWallet = "0x5fCb8f7149E8aD03544157C90E6f81b26933d3a2";
  const feeToken = "0x0000000000000000000000000000000000000000";
  const burnPercent = "0";

  const vipDisAmount = ethers.utils.parseEther("300") // DIS
  const vipPercent = "100" // %
  const holdersDisAmount = ethers.utils.parseEther("100") // DIS
  const holdersPercent = "40" // %
  const publicDisAmount = ethers.utils.parseEther("10") // DIS
  const publicPercent = "10"//  %

  const TierSystemFactory = await ethers.getContractFactory(TierSystem.abi, TierSystem.bytecode);
  const IDOMasterFactory = await ethers.getContractFactory(IDOMaster.abi, IDOMaster.bytecode);
  const IDOCreatorFactory = await ethers.getContractFactory(IDOCreator.abi, IDOCreator.bytecode);
  tierSystem = await TierSystemFactory.deploy(
    vipDisAmount,
    vipPercent,
    holdersDisAmount,
    holdersPercent,
    publicDisAmount,
    publicPercent
  );
  console.log("TierSystem:", tierSystem.address);
  idoMaster = await IDOMasterFactory.deploy(
    feeToken, feeWallet, feeAmount, burnPercent
  );
  console.log("IDOMaster:", idoMaster.address);

  idoCreator = await IDOCreatorFactory.deploy(
    idoMaster.address, tierSystem.address
  );
  console.log("IDOCreator:", idoCreator.address);

  let tx = await idoMaster.setCreatorProxy(idoCreator.address);
  console.log("Calling idoMaster.setCreatorProxy:", tx.hash);
  await tx.wait();
  console.log("Done!", tx.hash);

};

module.exports.tags = ["TosDis"];
