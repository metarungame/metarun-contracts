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
    await this.token.mint(this.deployer.address, "1000000");
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
    const day = 60 * 60 * 24;

    beforeEach(async function () {
      this.now = (await ethers.provider.getBlock("latest")).timestamp;
      await this.vesting.createVesting(this.beneficiary.address, this.now, 1, day, "1000000");
    });

    it("beneficiary has proper allocation", async function () {
      const vesting = await this.vesting.getVesting(this.beneficiary.address);
      expect(vesting[0]).to.equal(this.now);
      expect(vesting[1]).to.equal("1");
      expect(vesting[2]).to.equal(day);
      expect(vesting[3]).to.equal("1000000");
    });

    it("releasable amount is non-zero", async function () {
      expect(await this.vesting.releasableAmount(this.beneficiary.address)).to.equal("11");
    });

    it("releasable amount can be released", async function () {
      // todo: subject for refactoring. Depends on hardhat's timing.
      // should be mocked
      expect(await this.vesting.releasableAmount(this.beneficiary.address)).to.equal("11");
      tx = await this.vesting.release(this.beneficiary.address);
      await expect(tx).to.emit(this.token, "Transfer").withArgs(this.vesting.address, this.beneficiary.address, "23");
      expect(await this.vesting.releasableAmount(this.beneficiary.address)).to.equal("0");
      tx = await this.vesting.release(this.beneficiary.address);
      await expect(tx).to.emit(this.token, "Transfer").withArgs(this.vesting.address, this.beneficiary.address, "11");
    });
  });
});
