const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("TokenVesting", function () {
  before(async function () {
    this.vestingFactory = await ethers.getContractFactory("TokenVesting");
  });

  beforeEach(async function () {
    this.vesting = await this.vestingFactory.deploy("0x0000000000000000000000000000000000000001");
  });

  it("contract is deployed", async function () {
    await this.vesting.deployed();
  });
});
