const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { applyWorkaround } = require("hardhat/internal/util/antlr-prototype-pollution-workaround");
const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = constants;

describe("Metarun Token Vesting", function () {
  const initialSupply = ethers.utils.parseUnits("1000000");
  let vestingStartDate;
  const DAY = 60 * 60 * 24;
  const MONTH = DAY * 30;
  const interval = 3600;
  const zeroInterval = 0;
  const duration = interval * 4;
  const balance = ethers.utils.parseUnits("1");
  const ethAmount = 1;

  beforeEach(async function () {
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.stranger = this.signers[1];

    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    vestingStartDate = block.timestamp + MONTH;

    this.tokenFactory = await ethers.getContractFactory("MetarunToken");
    this.vestingFactory = await ethers.getContractFactory("TokenVestingMock");
    this.token = await this.tokenFactory.deploy();
    await this.token.mint(this.deployer.address, initialSupply);
    this.vesting = await this.vestingFactory.deploy(this.token.address);
    this.token.approve(this.vesting.address, initialSupply);
    await this.vesting.setCurrentBlockTime(block.timestamp);
  });
  it("getter returns zeroes for unconfigured vestings", async function () {
    const vesting = await this.vesting.getVesting(this.stranger.address);
    expect(vesting[0]).to.equal("0");
    expect(vesting[1]).to.equal("0");
    expect(vesting[2]).to.equal("0");
    expect(vesting[3]).to.equal("0");
    expect(vesting[4]).to.equal("0");
  });

  it("Create vesting with zero token should revert", async function () {
    await expect(this.vestingFactory.deploy(ZERO_ADDRESS)).to.be.revertedWith("token address cannot be zero");
  });

  describe("Create vesting", function () {
    describe("reverts", function () {
      it("when interval > duration", async function () {
        await expect(this.vesting.createVesting(this.deployer.address, vestingStartDate, interval + 1, interval, balance)).to.be.revertedWith(
          "TokenVesting #createVesting: interval cannot be bigger than duration"
        );
      });
      it("when interval = 0", async function () {
        await expect(this.vesting.createVesting(this.deployer.address, vestingStartDate, 0, duration, balance)).to.be.revertedWith(
          "TokenVesting #createVesting: interval must be greater than 0"
        );
      });
      it("when current balance > 0", async function () {
        // Create vesting for user
        await this.vesting.createVesting(this.deployer.address, vestingStartDate, interval, duration, balance);
        // Try to create another vesting
        await expect(this.vesting.createVesting(this.deployer.address, vestingStartDate, interval, duration, balance)).to.be.revertedWith(
          "TokenVesting #createVesting: vesting for beneficiary already created"
        );
      });
    });

    describe("Check vesting after intervals", function () {
      beforeEach("Create vesting", async function () {
        await this.vesting.createVesting(this.deployer.address, vestingStartDate, interval, duration, balance);
      });
      it("Check vesting before start, should return zero", async function () {
        expect(await this.vesting.vestedAmount(this.deployer.address)).to.be.equal(0);
      });

      it("Check vesting after 1 interval", async function () {
        const intervalNumber = 1;
        let currentVestingData = await this.vesting.getVesting(this.deployer.address);
        let currentVestingStartDate = Number(currentVestingData[0]);
        await this.vesting.setCurrentBlockTime(currentVestingStartDate + interval * intervalNumber);
        const vestedAmount = await this.vesting.vestedAmount(this.deployer.address);
        const intervalsVestedBN = ethers.BigNumber.from(ethAmount * intervalNumber);
        const durationBN = ethers.BigNumber.from(duration);
        const intervalBN = ethers.BigNumber.from(interval);
        const expectedVestedAmount = balance.mul(intervalsVestedBN).div(durationBN.div(intervalBN));
        expect(vestedAmount).to.equal(expectedVestedAmount);
      });

      it("Check vesting after 2 intervals", async function () {
        const intervalNumber = 2;
        let currentVestingData = await this.vesting.getVesting(this.deployer.address);
        let currentVestingStartDate = Number(currentVestingData[0]);
        await this.vesting.setCurrentBlockTime(currentVestingStartDate + interval * intervalNumber);
        const vestedAmount = await this.vesting.vestedAmount(this.deployer.address);
        const intervalsVestedBN = ethers.BigNumber.from(ethAmount * intervalNumber);
        const durationBN = ethers.BigNumber.from(duration);
        const intervalBN = ethers.BigNumber.from(interval);
        const expectedVestedAmount = balance.mul(intervalsVestedBN).div(durationBN.div(intervalBN));
        expect(vestedAmount).to.equal(expectedVestedAmount);
      });

      it("Check vesting after 1.5 intervals", async function () {
        const intervalNumber = 1;
        const halfInterval = interval / 2;
        let currentVestingData = await this.vesting.getVesting(this.deployer.address);
        let currentVestingStartDate = Number(currentVestingData[0]);
        await this.vesting.setCurrentBlockTime(currentVestingStartDate + interval * intervalNumber + halfInterval);
        const vestedAmount = await this.vesting.vestedAmount(this.deployer.address);
        const intervalsVestedBN = ethers.BigNumber.from(ethAmount * intervalNumber);
        const durationBN = ethers.BigNumber.from(duration);
        const intervalBN = ethers.BigNumber.from(interval);
        const expectedVestedAmount = balance.mul(intervalsVestedBN).div(durationBN.div(intervalBN));
        expect(vestedAmount).to.equal(expectedVestedAmount);
      });

      it("Check vesting after duration, should return total amount", async function () {
        let currentVestingData = await this.vesting.getVesting(this.deployer.address);
        let currentVestingStartDate = Number(currentVestingData[0]);
        await this.vesting.setCurrentBlockTime(currentVestingStartDate + duration);
        const vestedAmount = await this.vesting.vestedAmount(this.deployer.address);
        expect(vestedAmount).to.equal(balance);
      });
    });

    describe("Check release after intervals", function () {
      beforeEach("Create vesting", async function () {
        await this.vesting.createVesting(this.deployer.address, vestingStartDate, interval, duration, balance);
      });

      it("Check unreleased 0<, nothing to release", async function () {
        let currentVestingData = await this.vesting.getVesting(this.deployer.address);
        const currentVestingStartDate = Number(currentVestingData[0]);
        await this.vesting.setCurrentBlockTime(currentVestingStartDate - 1);
        await expect(this.vesting.release(this.deployer.address)).to.be.revertedWith("TokenVesting #release: nothing to release");
      });

      it("Check release after 1 interval", async function () {
        const intervalNumber = 1;
        let currentVestingData = await this.vesting.getVesting(this.deployer.address);
        let currentVestingStartDate = Number(currentVestingData[0]);
        const balanceBefore = await this.token.balanceOf(this.deployer.address);
        const releasableAmountBeforeTimeChange = await this.vesting.releasableAmount(this.deployer.address);
        await this.vesting.setCurrentBlockTime(currentVestingStartDate + interval * intervalNumber);
        const releasableAmount = await this.vesting.releasableAmount(this.deployer.address);
        const vestedAmount = await this.vesting.vestedAmount(this.deployer.address);
        const intervalsVestedBN = ethers.BigNumber.from(ethAmount * intervalNumber);
        const durationBN = ethers.BigNumber.from(duration);
        const intervalBN = ethers.BigNumber.from(interval);
        const expectedVestedAmount = balance.mul(intervalsVestedBN).div(durationBN.div(intervalBN));
        expect(vestedAmount.sub(releasableAmountBeforeTimeChange)).to.equal(expectedVestedAmount.sub(releasableAmountBeforeTimeChange));
        await expect(this.vesting.release(this.deployer.address)).to.emit(this.vesting, "Released").withArgs(releasableAmount);
        expect(await this.token.balanceOf(this.deployer.address)).to.be.equal(BigInt(balanceBefore) + BigInt(releasableAmount));
      });

      it("Check release after 2 intervals", async function () {
        const oneInterval = interval;
        const twoIntervals = interval * 2;
        let currentVestingData = await this.vesting.getVesting(this.deployer.address);
        let currentVestingStartDate = Number(currentVestingData[0]);
        const balanceBefore = await this.token.balanceOf(this.deployer.address);
        const releasableAmountBeforeTimeChange = await this.vesting.releasableAmount(this.deployer.address);
        await this.vesting.setCurrentBlockTime(currentVestingStartDate + oneInterval);
        const releasableAmount = await this.vesting.releasableAmount(this.deployer.address);
        const vestedAmount = await this.vesting.vestedAmount(this.deployer.address);
        const intervalsVestedBN = ethers.BigNumber.from(ethAmount);
        const durationBN = ethers.BigNumber.from(duration);
        const intervalBN = ethers.BigNumber.from(interval);
        const expectedVestedAmount = balance.mul(intervalsVestedBN).div(durationBN.div(intervalBN));
        expect(vestedAmount.sub(releasableAmountBeforeTimeChange)).to.equal(expectedVestedAmount.sub(releasableAmountBeforeTimeChange));
        await expect(this.vesting.release(this.deployer.address)).to.emit(this.vesting, "Released").withArgs(releasableAmount);
        expect(await this.token.balanceOf(this.deployer.address)).to.be.equal(BigInt(balanceBefore) + BigInt(releasableAmount));

        await this.vesting.setCurrentBlockTime(currentVestingStartDate + twoIntervals);

        const expectedVestedAmountAfterRelease = balance
          .mul(intervalsVestedBN)
          .div(durationBN.div(intervalBN))
          .sub(releasableAmountBeforeTimeChange);
        expect(await this.vesting.releasableAmount(this.deployer.address)).to.equal(expectedVestedAmountAfterRelease);
      });

      it("Check releasableAmount after duration, should return total amount", async function () {
        let currentVestingData = await this.vesting.getVesting(this.deployer.address);
        let currentVestingStartDate = Number(currentVestingData[0]);
        await this.vesting.setCurrentBlockTime(currentVestingStartDate + duration);
        const releasableAmount = await this.vesting.releasableAmount(this.deployer.address);
        expect(releasableAmount).to.equal(balance);
      });
    });

    describe(`postpone vesting`, function () {
      beforeEach("Create vesting", async function () {
        await this.vesting.createVesting(this.deployer.address, vestingStartDate, interval, duration, balance);
      });
      describe("reverts", function () {
        it("when balance is 0 (vesting not extists)", async function () {
          let currentTime = await this.vesting.getCurrentBlockTime();
          let newStart = currentTime + MONTH * 12;
          await expect(this.vesting.connect(this.stranger).postponeVesting(newStart)).to.be.revertedWith(
            "TokenVesting #postponeVesting: vesting for beneficiary does not exist"
          );
        });
        it("new start is equal to old start", async function () {
          let currentVestingData = await this.vesting.getVesting(this.deployer.address);
          let currentVestingStartDate = Number(currentVestingData[0]);
          await expect(this.vesting.postponeVesting(currentVestingStartDate)).to.be.revertedWith(
            "TokenVesting #postponeVesting: new start date cannot be earlier than original start date"
          );
        });
        it("new start is before old start", async function () {
          let currentVestingData = await this.vesting.getVesting(this.deployer.address);
          let currentVestingStartDate = Number(currentVestingData[0]);
          let wrongNewStart = currentVestingStartDate - 1;
          await expect(this.vesting.postponeVesting(wrongNewStart)).to.be.revertedWith(
            "TokenVesting #postponeVesting: new start date cannot be earlier than original start date"
          );
        });
      });

      it("Postpone Vesting for 30 days", async function () {
        let currentVestingData = await this.vesting.getVesting(this.deployer.address);
        let currentVestingStartDate = Number(currentVestingData[0]);
        let newStart = currentVestingStartDate + MONTH;

        await this.vesting.postponeVesting(newStart);
        const vesting = await this.vesting.getVesting(this.deployer.address);

        expect(vesting[0]).to.equal(newStart);
        expect(vesting[1]).to.equal(interval);
        expect(vesting[2]).to.equal(duration);
        expect(vesting[3]).to.equal(balance);
        expect(vesting[4]).to.equal("0");
      });
    });
  });

  describe("check TokenVesting", function () {
    it("test _getCurrentBlockTime function", async function () {
      const tokenFactory = await ethers.getContractFactory("MetarunToken");
      const vestingFactory = await ethers.getContractFactory("TokenVesting");
      const token = await tokenFactory.deploy();
      await token.mint(this.deployer.address, initialSupply);
      const vesting = await vestingFactory.deploy(token.address);
      token.approve(vesting.address, initialSupply);

      await vesting.vestedAmount(ZERO_ADDRESS);
    });
  });
});
