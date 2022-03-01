const { expect } = require("chai");
const { ethers } = require("hardhat");

function getNextReleasable(_lockBps, _vestBps, _currentTime, _lockClaimTime, _vestStart, _vestDuration, _vestInterval, amount, released) {
    let nextReleasable = 0;
    let nextReleaseTime = 0;
    const lockedByVestAmount = amount / 10000 * _vestBps;
    const lockedByTimeAmount = amount / 10000 * _lockBps;
    const countOfIntervals = _vestDuration / _vestInterval;
    const lockedPerSingleInterval = lockedByVestAmount / countOfIntervals;
    const vestEnding = _vestStart + _vestDuration;

    if (_currentTime < _lockClaimTime) {
        nextReleasable = lockedByTimeAmount - released;
        nextReleaseTime = _lockClaimTime;
    }
    else if (_currentTime < _vestStart) {
        nextReleasable = lockedByTimeAmount - released;
        nextReleaseTime = _vestStart;
    }
    else if (_currentTime < vestEnding) {
        const passedIntervals = Math.floor((_currentTime - _vestStart) / _vestInterval);
        nextReleasable = lockedByTimeAmount + (passedIntervals + 1) * lockedPerSingleInterval - released;
        nextReleaseTime = _vestStart + (passedIntervals + 1) * _vestInterval;
    }
    else {
        nextReleasable = lockedByTimeAmount + lockedByVestAmount - released;
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
        this.assertRelease = async function (currentTime, expectedNextReleaseTime) {
            let { nextReleasable, nextReleaseTime } = getNextReleasable(
                timeLockedBps,
                vestedBps,
                currentTime,
                lockClaimTime,
                vestStart,
                vestDuration,
                vestInterval,
                totalAmount,
                0
            );
            expect(nextReleaseTime).to.be.eq(expectedNextReleaseTime);
            if(nextReleaseTime == -1)
                nextReleaseTime = currentTime + 10000000000;
            await this.vesting.setCurrentBlockTime(nextReleaseTime);
            const allocation = await this.vesting.getAllocation(this.investor.address);
            const releasableExpected = allocation[9];
            expect(releasableExpected).to.be.eq(nextReleasable);
        }
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
        await this.assertRelease(timeBeforeLockClaim, lockClaimTime);
    });

    it("after time lock but before vest starts", async function () {
        const timeBeforeVest = Math.floor((lockClaimTime + vestStart) / 2);
        await this.assertRelease(timeBeforeVest, vestStart);

    });

    it("at the start of first interval", async function () {
        const startOfFirstInterval = vestStart;
        await this.assertRelease(startOfFirstInterval, vestStart + vestInterval);
    });

    it("at the middle of first interval", async function () {
        const middleOfFirstInterval = vestStart + Math.floor(vestInterval / 2);
        await this.assertRelease(middleOfFirstInterval, vestStart + vestInterval);
    });

    it("at the end of first interval", async function () {
        const endOfFirstInterval = vestStart + vestInterval - 1;
        await this.assertRelease(endOfFirstInterval, vestStart + vestInterval);
    });

    it("at the beginning of second interval", async function(){
        const startOfSecondInterval = vestStart + vestInterval;
        await this.assertRelease(startOfSecondInterval, vestStart + vestInterval*2);
    });

    it("at the beginning of second interval", async function(){
        const startOfSecondInterval = vestStart + vestInterval;
        await this.assertRelease(startOfSecondInterval, vestStart + vestInterval*2);
    });

    it("at the beginning of last interval", async function(){
        const startOfLastInterval = vestStart + vestDuration - vestInterval;
        await this.assertRelease(startOfLastInterval, vestStart + vestDuration);
    });

    it("at the middle of last interval", async function(){
        const startOfLastInterval = vestStart + vestDuration - Math.floor(vestInterval / 2);
        await this.assertRelease(startOfLastInterval, vestStart + vestDuration);
    });

    it("at the end of vesting", async function(){
        const startOfLastInterval = vestStart + vestDuration;
        await this.assertRelease(startOfLastInterval, -1);
    });

});