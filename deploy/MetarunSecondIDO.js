module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute, read } = deployments;
  const { deployer } = await getNamedAccounts();

  const TierSystem = require("../contracts/artifacts/TierSystem.json");
  const IDOCreator = require("../contracts/artifacts/IDOCreator.json");
  const IDOMaster = require("../contracts/artifacts/IDOMaster.json");
  const ERC20Basic = require("../contracts/artifacts/ERC20Basic.json");
  const IDOPool = require("../contracts/artifacts/IDOPool.json");

  const hasWhitelisting = false;
  const enableTierSystem = true;

  const previousIDOPool = "0xd5Bd5013cfc95B679058F58071fdbB492e5C8049";

  // IDO time and economic boundaries
  //const amount = ethers.utils.parseEther("2000000"); // MRUN
  const tokenPrice = ethers.utils.parseEther("0.0164473"); // MATIC
  const minEthPayment = ethers.utils.parseEther("0.000001"); // MATIC
  const maxEthPayment = ethers.utils.parseEther("1973.684211"); // MATIC
  //const maxDistributedTokenAmount = amount;
  const startTimestamp = Date.parse("2022-02-20T17:00:00+00:00")/1000;
  console.log("startTimestamp:", startTimestamp);
  const finishTimestamp = Date.parse("2022-02-20T19:00:00+00:00")/1000;
  console.log("finishTimestamp:", finishTimestamp);
  const startClaimTimestamp = Date.parse("2022-02-22T16:00:00+00:00")/1000;
  console.log("startClaimTimestamp:", startClaimTimestamp);

  vestingPercent = 90;
  vestingStart = Date.parse("2022-02-22T15:00:00+00:00")/1000;
  vestingInterval = 60 * 60 * 24 * 30;
  vestingDuration = 60 * 60 * 24 * 30 * 9;

  const vipDisAmount = ethers.utils.parseEther("300");
  const vipPercent = 100;
  const holdersDisAmount = ethers.utils.parseEther("100");
  const holdersPercent = 34;
  const publicDisAmount = ethers.utils.parseEther("10");
  const publicPercent = 10;

  hardhatChainId = ethers.provider._hardhatProvider._provider._chainId;
  backupChainId = 137;
  const chainId = hardhatChainId ?  hardhatChainId : backupChainId;
  
  console.log("Loading periphery contracts for chainID", chainId);
  this.tierSystem = await ethers.getContractAt(TierSystem.abi, TierSystem.networks[chainId.toString()].address);
  console.log("  TierSystem", this.tierSystem.address);
  this.idoCreator = await ethers.getContractAt(IDOCreator.abi, IDOCreator.networks[chainId.toString()].address);
  console.log("  IDOCreator", this.idoCreator.address);
  this.idoMaster = await ethers.getContractAt(IDOMaster.abi, IDOMaster.networks[chainId.toString()].address);
  console.log("  IDOMaster", this.idoMaster.address);
  this.IdoPoolFactory = await ethers.getContractFactory(IDOPool.abi, IDOPool.bytecode);

  console.log("Reconfigure tierSystem");
  let tx = await this.tierSystem.setTier(
    vipDisAmount,
    vipPercent,
    holdersDisAmount,
    holdersPercent,
    publicDisAmount,
    publicPercent
  );
  console.log(" Tx:", tx.hash);
  await tx.wait();
  console.log(" Tx mined");


  const token = await deployments.get("MetarunToken");

  console.log("Withdraw non-sold tokens from the previous pool");
  this.prevPool = await ethers.getContractAt(IDOPool.abi, previousIDOPool);
  tx = await this.prevPool.withdrawNotSoldTokens();
  console.log(" Tx:", tx.hash);
  await tx.wait();
  console.log(" Tx mined");

  const amount = await read(
    'MetarunToken',
    { log: true },
    'balanceOf',
    deployer
  );
  console.log("Unsold:", amount.toString());
  const maxDistributedTokenAmount = amount;

  await execute(
    'MetarunToken',
    { from: deployer, log: true },
    'approve',
    this.idoCreator.address,
    amount
  );

  tx = await this.idoCreator.createIDO(
    tokenPrice,
    token.address,
    startTimestamp,
    finishTimestamp,
    startClaimTimestamp,
    minEthPayment,
    maxEthPayment,
    maxDistributedTokenAmount,
    hasWhitelisting,
    enableTierSystem,
  );
  console.log("Sent Tx:", tx.hash);
  const txReceipt = await tx.wait();
  if (txReceipt.logs.length == 0) {
    console.log("Ido creation failed. It's expected if IDO creator not deployed.");
    return;
  }
  idoPoolAddress = this.idoMaster.interface.parseLog(txReceipt.logs[4]).args.idoPool;
  console.log("IDOPool created:", idoPoolAddress);
  this.idoPool = await ethers.getContractAt(IDOPool.abi, idoPoolAddress);
  console.log("Setting vesting on IDO Pool:", idoPoolAddress);
  tx = await this.idoPool.setVesting(vestingPercent, vestingStart, vestingInterval, vestingDuration);
  console.log("Sent Tx:", tx.hash);
  await tx.wait();
};

module.exports.tags = ["CreateSecondIDO"];
module.exports.dependencies = ["MetarunToken"];
