const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Metarun Token Vesting", function () {
  const initialSupply = ethers.utils.parseUnits("1000000");

  beforeEach(async function () {
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.stranger = this.signers[1];
    this.tokenFactory = await ethers.getContractFactory("MetarunToken");
    this.vestingFactory = await ethers.getContractFactory("TokenVesting");
    this.token = await this.tokenFactory.deploy();
    await this.token.mint(this.deployer.address, initialSupply);
    this.vesting = await this.vestingFactory.deploy(this.token.address);
  });

  it("getter returns zeroes for unconfigured vestings", async function () {
    const vesting = await this.vesting.getVesting(this.stranger.address);
    expect(vesting[0]).to.equal('0');
    expect(vesting[1]).to.equal('0');
    expect(vesting[2]).to.equal('0');
    expect(vesting[3]).to.equal('0');
    expect(vesting[4]).to.equal('0');
  });
});
