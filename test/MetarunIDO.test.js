const { expect } = require("chai");
const { ethers, artifacts } = require("hardhat");
const TierSystem = require("../contracts/artifacts/TierSystem.json");
const IDOCreator = require("../contracts/artifacts/IDOCreator.json");
const IDOMaster = require("../contracts/artifacts/IDOMaster.json");
const ERC20Basic = require("../contracts/artifacts/ERC20Basic.json");
const IDOPool = require("../contracts/artifacts/IDOPool.json");

describe("Metarun IDO on TosDis platform", function () {

  const hasWhitelisting = false;
  const enableTierSystem = true;

  // IDO time and economic boundaries
  const totalSupply = ethers.utils.parseEther("1000000");
  const tokenPrice = ethers.utils.parseEther("0.1");
  const minEthPayment = ethers.utils.parseEther("0.1");
  const maxEthPayment = ethers.utils.parseEther("1");
  const maxDistributedTokenAmount = totalSupply;

  // IDO TierSystem configuration
  const vipDisAmount = ethers.utils.parseEther("100");
  const vipPercent = 100;
  const holdersDisAmount = ethers.utils.parseEther("10");
  const holdersPercent = 25;
  const publicDisAmount = ethers.utils.parseEther("0.001");
  const publicPercent = 10;

  beforeEach(async function () {
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];

    this.tierSystemFactory = await ethers.getContractFactory(TierSystem.abi, TierSystem.bytecode);
    this.IDOCreatorFactory = await ethers.getContractFactory(IDOCreator.abi, IDOCreator.bytecode);
    this.IDOMasterFactory = await ethers.getContractFactory(IDOMaster.abi, IDOMaster.bytecode);
    this.FeeTokenFactory = await ethers.getContractFactory(ERC20Basic.abi, ERC20Basic.bytecode);
    this.tokenFactory = await ethers.getContractFactory("MetarunToken");

    const currentBlock = await ethers.provider.getBlock('latest'); //todo: remove from describe - slows down?
    const now = currentBlock.timestamp;
    this.startTimestamp = now;
    this.finishTimestamp = this.startTimestamp + 60 * 60 * 24 * 7;
    this.startClaimTimestamp = this.finishTimestamp;

    this.feeToken = await this.FeeTokenFactory.deploy(totalSupply);

    this.tierSystem = await this.tierSystemFactory.deploy(vipDisAmount, vipPercent, holdersDisAmount, holdersPercent, publicDisAmount, publicPercent);
    await this.tierSystem.addBalances([this.deployer.address], [ethers.utils.parseEther("0.001")]);

    this.idoMaster = await this.IDOMasterFactory.deploy(this.feeToken.address, ethers.constants.AddressZero, 0, 0);
    this.idoCreator = await this.IDOCreatorFactory.deploy(this.idoMaster.address, this.tierSystem.address);
    await this.idoMaster.setCreatorProxy(this.idoCreator.address);
    this.token = await this.tokenFactory.deploy();
    await this.token.mint(this.deployer.address, totalSupply);
    await this.token.approve(this.idoCreator.address, totalSupply);
    const tx = await this.idoCreator.createIDO(
      tokenPrice,
      this.token.address,
      this.startTimestamp,
      this.finishTimestamp,
      this.startClaimTimestamp,
      minEthPayment,
      maxEthPayment,
      maxDistributedTokenAmount,
      hasWhitelisting,
      enableTierSystem,
    );
    const txReceipt = await tx.wait();
    idoPoolAddress = this.idoMaster.interface.parseLog(txReceipt.logs[4]).args.idoPool;
    this.idoPool = await ethers.getContractAt(IDOPool.abi, idoPoolAddress);
  });

  it("tierSystem deployed and configured", async function () {
    const vipTier = await this.tierSystem.vipTier();
    expect(vipTier.disAmount).to.equal(vipDisAmount);
    expect(vipTier.percent).to.equal(vipPercent);
    const holdersTier = await this.tierSystem.holdersTier();
    expect(holdersTier.disAmount).to.equal(holdersDisAmount);
    expect(holdersTier.percent).to.equal(holdersPercent);
    const publicTier = await this.tierSystem.publicTier();
    expect(publicTier.disAmount).to.equal(publicDisAmount);
    expect(publicTier.percent).to.equal(publicPercent);
  });

  it("IDO pool deployed and configured", async function () {
    expect(await this.idoPool.tokenPrice()).to.equal(tokenPrice);
    expect(await this.idoPool.rewardToken()).to.equal(this.token.address);
    expect(await this.idoPool.decimals()).to.equal(await this.token.decimals());
    expect(await this.idoPool.startTimestamp()).to.equal(this.startTimestamp);
    expect(await this.idoPool.finishTimestamp()).to.equal(this.finishTimestamp);
    expect(await this.idoPool.startClaimTimestamp()).to.equal(this.startClaimTimestamp);
    expect(await this.idoPool.minEthPayment()).to.equal(minEthPayment);
    expect(await this.idoPool.maxEthPayment()).to.equal(maxEthPayment);
    expect(await this.idoPool.maxDistributedTokenAmount()).to.equal(maxDistributedTokenAmount);
    expect(await this.idoPool.tokensForDistribution()).to.equal(0);
    expect(await this.idoPool.distributedTokens()).to.equal(0);
    expect(await this.idoPool.idoMaster()).to.equal(this.idoMaster.address);
    expect(await this.idoPool.feeFundsPercent()).to.equal(0);
  });

  it("tierSystem has proper status", async function () {
    expect(await this.idoPool.enableTierSystem()).to.equal(enableTierSystem);
  });

  it("buyer can purchase", async function () {
    await this.idoPool.pay({value: ethers.utils.parseEther("0.1")});
    let userInfo = await this.idoPool.userInfo(this.deployer.address);
    expect(userInfo.total).to.equal(ethers.utils.parseEther("1"));
    expect(userInfo.debt).to.equal(ethers.utils.parseEther("1"));
  });
});
