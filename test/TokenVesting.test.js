const { ethers } = require("hardhat");
const { expect } = require("chai");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("TokenVesting", function () {
  before(async function () {
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.beneficiary = this.signers[1];
    this.vestingFactory = await ethers.getContractFactory("TokenVesting");
    this.tokenFactory = await ethers.getContractFactory("MetarunToken");
  });

  beforeEach(async function () {
    this.token = await this.tokenFactory.deploy();
    this.vesting = await this.vestingFactory.deploy(this.token.address);
    await this.token.approve(this.vesting.address, await this.token.totalSupply());
  });

  it("beneficiary doesn't have any allocation", async function () {
    const vesting = await this.vesting.getVesting(this.beneficiary.address);
    expect(vesting[0]).to.equal("0");
    expect(vesting[1]).to.equal("0");
    expect(vesting[2]).to.equal("0");
    expect(vesting[3]).to.equal("0");
  });

  describe("after vesting configured", async function () {
    const now = "1643707273";
    const day = 60 * 60 * 24;

    beforeEach(async function () {
      this.vesting.createVesting(this.beneficiary.address, now, 1, day, 0);
    });

    it("beneficiary has proper allocation", async function () {
      const vesting = await this.vesting.getVesting(this.beneficiary.address);
      expect(vesting[0]).to.equal(now);
      expect(vesting[1]).to.equal("1");
      expect(vesting[2]).to.equal(day);
      expect(vesting[3]).to.equal("0");
    });
  });
});
