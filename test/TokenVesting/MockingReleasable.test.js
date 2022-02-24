const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Vesting Math underflow/overflow", function () {
  this.beforeEach(async function () {
    this.TokenVestingMathMock = await ethers.getContractFactory("TokenVestingMockReleasable");
    this.MetarunToken = await ethers.getContractFactory("MetarunToken");
    this.token = await this.MetarunToken.deploy();
    this.vesting = await this.TokenVestingMathMock.deploy(this.token.address);

    this.signers = await ethers.getSigners();

    this.deployer = this.signers[0];
    this.deployerAddress = this.deployer.address;

    this.beneficiary = this.signers[1];
    this.beneficiaryAddress = this.beneficiary.address;

    await this.token.mint(this.deployerAddress, 1000);
    await this.token.approve(this.vesting.address, 1000);
    this.zeroPoint = 1;
    this.start = 10;
    this.cliff = 20;
    this.interval = 2;
    this.duration = 30;
    this.amount = 500;
    await this.vesting.createVesting(this.beneficiaryAddress, this.start, this.cliff, this.interval, this.duration, this.amount);
  });

  describe("Vesting amount calculations", function () {
    it("should throw underflow when release negative amount", async function () {
      await this.vesting.setCurrentBlockTime(this.cliff);
      await this.vesting.setReleasableAmount(1000);
      await expect(this.vesting.release(this.beneficiaryAddress)).to.be.revertedWith(
        "panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)"
      );
    });
  });
});
