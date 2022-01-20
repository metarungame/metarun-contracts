const { expect } = require("chai");
const { ethers, artifacts } = require("hardhat");
const TierSystem = require("../contracts/artifacts/TierSystem.json");

describe("Metarun IDO on TosDis platform", function () {

  const vipDisAmount = ethers.utils.parseEther("100");
  const vipPercent = 80;
  const holdersDisAmount = ethers.utils.parseEther("10");
  const holdersPercent = 25;
  const publicDisAmount = ethers.utils.parseEther("10");
  const publicPercent = 5;

  beforeEach(async function () {
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];

    this.tierSystemFactory = await ethers.getContractFactory(TierSystem.abi, TierSystem.bytecode);
    this.tierSystem = await this.tierSystemFactory.deploy(vipDisAmount, vipPercent, holdersDisAmount, holdersPercent, publicDisAmount, publicPercent);
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
});
