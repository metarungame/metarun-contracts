const { ethers } = require("hardhat");
const { expect } = require("chai");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("TokenVesting", function () {
  before(async function () {
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.beneficiary = this.signers[1];
    this.vestingFactory = await ethers.getContractFactory("TokenVesting");
  });

  beforeEach(async function () {
    this.vesting = await this.vestingFactory.deploy("0x0000000000000000000000000000000000000001");
  });

  it("beneficiary doesn't have any allocation", async function () {
    const vesting = await this.vesting.getVesting(this.beneficiary.address);
    expect(vesting[0]).to.equal("0");
    expect(vesting[1]).to.equal("0");
    expect(vesting[2]).to.equal("0");
    expect(vesting[3]).to.equal("0");
  });
});
