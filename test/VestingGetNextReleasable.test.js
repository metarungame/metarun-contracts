const { expect } = require("chai");
const { ethers } = require("hardhat");

function getNextReleasable(_lockBps, _vestBps, _currentTime, _lockClaimTime, _vestStart, _vestDuration, _vestInterval, _amount, _released) {
  let nextReleasable = 0;
  let nextReleaseTime = 0;
  const lockedByVestAmount = (_amount / 10000) * _vestBps;
  const lockedByTimeAmount = (_amount / 10000) * _lockBps;
  const countOfIntervals = _vestDuration / _vestInterval;
  const lockedPerSingleInterval = lockedByVestAmount / countOfIntervals;
  const vestEnding = _vestStart + _vestDuration;

  if (_currentTime < _lockClaimTime) {
    nextReleasable = lockedByTimeAmount - _released;
    nextReleaseTime = _lockClaimTime;
  } else if (_currentTime < _vestStart) {
    nextReleasable = lockedByTimeAmount - _released;
    nextReleaseTime = _vestStart;
    if (nextReleasable == 0) {
      nextReleasable = lockedPerSingleInterval;
      nextReleaseTime = _vestStart + _vestInterval;
    }
  } else if (_currentTime < vestEnding) {
    const passedIntervals = Math.floor((_currentTime - _vestStart) / _vestInterval);
    nextReleasable = lockedByTimeAmount + (passedIntervals + 1) * lockedPerSingleInterval - _released;
    nextReleaseTime = _vestStart + (passedIntervals + 1) * _vestInterval;
  } else {
    nextReleasable = lockedByTimeAmount + lockedByVestAmount - _released;
    nextReleaseTime = -1;
  }
  return { nextReleasable, nextReleaseTime };
}

describe("getNextReleasable gives correct release info for the moment", function () {
  function getTimestamp() {
    return Math.floor(new Date().getTime() / 1000);
  }
  const timeLockedBps = "1000";
  const vestedBps = "9000";
  const lockClaimTime = getTimestamp() + 20;
  const vestStart = getTimestamp() + 40;
  const vestDuration = 1000;
  const vestInterval = 10;
  const totalAmount = 10000000;

  this.beforeAll(async function () {
    /*
            This function is being called inside each test.
            The idea:
            1) check how much tokens are already released for the moment of currentTime
            2) call function being tested with specified params
            3) check returned nextReleaseTime == expectedNextReleaseTime
            4) check returned nextReleasable equals to contract's releasable at the moment nextReleaseTime 
        */
    this.performAssertion = async function (currentTime, expectedNextReleaseTime) {
      await this.vesting.setCurrentBlockTime(currentTime);
      const alreadyReleased = (await this.vesting.getAllocation(this.investor.address))[3];
      let { nextReleasable, nextReleaseTime } = getNextReleasable(
        timeLockedBps,
        vestedBps,
        currentTime,
        lockClaimTime,
        vestStart,
        vestDuration,
        vestInterval,
        totalAmount,
        alreadyReleased
      );
      expect(nextReleaseTime).to.be.eq(expectedNextReleaseTime);
      if (nextReleaseTime == -1) nextReleaseTime = currentTime + 10000000000;
      await this.vesting.setCurrentBlockTime(nextReleaseTime);
      const releasableExpected = (await this.vesting.getAllocation(this.investor.address))[9];
      expect(releasableExpected).to.be.eq(nextReleasable);
    };
  });

  beforeEach(async function () {
    this.MetarunToken = await ethers.getContractFactory("MetarunToken");
    this.VestingMock = await ethers.getContractFactory("VestingMock");
    this.token = await this.MetarunToken.deploy();
    this.vesting = await this.VestingMock.deploy(
      this.token.address,
      timeLockedBps,
      vestedBps,
      lockClaimTime,
      vestStart,
      vestDuration,
      vestInterval
    );
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.investor = this.signers[1];
    await this.token.mint(this.deployer.address, totalAmount);
    await this.token.approve(this.vesting.address, totalAmount);
    await this.vesting.setAllocation(this.investor.address, totalAmount);
  });

  it("before time lock", async function () {
    const timeBeforeLockClaim = getTimestamp();
    await this.performAssertion(timeBeforeLockClaim, lockClaimTime);
  });

  it("after time lock but before vest starts", async function () {
    const timeBeforeVest = Math.floor((lockClaimTime + vestStart) / 2);
    await this.performAssertion(timeBeforeVest, vestStart);
  });

  it("after time lock but before vest starts with release", async function () {
    const timeBeforeVest = Math.floor((lockClaimTime + vestStart) / 2);
    await this.vesting.setCurrentBlockTime(timeBeforeVest);
    await this.vesting.release(this.investor.address);
    await this.performAssertion(timeBeforeVest, vestStart + vestInterval);
  });

  it("at the start of first interval", async function () {
    const startOfFirstInterval = vestStart;
    await this.performAssertion(startOfFirstInterval, vestStart + vestInterval);
  });

  it("at the start of first interval with release", async function () {
    const startOfFirstInterval = vestStart;
    await this.vesting.setCurrentBlockTime(startOfFirstInterval);
    await this.vesting.release(this.investor.address);
    await this.performAssertion(startOfFirstInterval, vestStart + vestInterval);
  });

  it("at the middle of first interval", async function () {
    const middleOfFirstInterval = vestStart + Math.floor(vestInterval / 2);
    await this.performAssertion(middleOfFirstInterval, vestStart + vestInterval);
  });

  it("at the end of first interval", async function () {
    const endOfFirstInterval = vestStart + vestInterval - 1;
    await this.performAssertion(endOfFirstInterval, vestStart + vestInterval);
  });

  it("at the start of second interval", async function () {
    const startOfSecondInterval = vestStart + vestInterval;
    await this.performAssertion(startOfSecondInterval, vestStart + vestInterval * 2);
  });

  it("at the start of second interval with release", async function () {
    const startOfSecondInterval = vestStart + vestInterval;
    await this.vesting.setCurrentBlockTime(startOfSecondInterval);
    await this.vesting.release(this.investor.address);
    await this.performAssertion(startOfSecondInterval, vestStart + vestInterval * 2);
  });

  it("at the middle of second interval", async function () {
    const startOfSecondInterval = vestStart + vestInterval + Math.floor(vestInterval / 2);
    await this.performAssertion(startOfSecondInterval, vestStart + vestInterval * 2);
  });

  it("at the beginning of last interval", async function () {
    const startOfLastInterval = vestStart + vestDuration - vestInterval;
    await this.performAssertion(startOfLastInterval, vestStart + vestDuration);
  });

  it("at the middle of last interval", async function () {
    const startOfLastInterval = vestStart + vestDuration - Math.floor(vestInterval / 2);
    await this.performAssertion(startOfLastInterval, vestStart + vestDuration);
  });

  it("at the middle of last interval with release", async function () {
    const startOfLastInterval = vestStart + vestDuration - Math.floor(vestInterval / 2);
    await this.vesting.setCurrentBlockTime(startOfLastInterval);
    await this.vesting.release(this.investor.address);
    await this.performAssertion(startOfLastInterval, vestStart + vestDuration);
  });

  it("at the end of vesting", async function () {
    const startOfLastInterval = vestStart + vestDuration;
    await this.performAssertion(startOfLastInterval, -1);
  });
});
