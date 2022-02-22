const {expect} = require("chai");
const {ethers} = require("hardhat");

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("Metarun Token Vesting", function () {
    const initialSupply = ethers.utils.parseUnits("1000000");
    let vestingStartDate;
    let cliff;
    const DAY = 60 * 60 * 24;
    const MONTH = DAY * 30;
    const interval = 3600;
    const duration = MONTH;
    const balance = ethers.utils.parseUnits("1");
    const ethAmount = 1;

    beforeEach(async function () {
        this.signers = await ethers.getSigners();
        this.deployer = this.signers[0];
        this.stranger = this.signers[1];

        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        vestingStartDate = block.timestamp + MONTH;
        cliff = vestingStartDate + interval * 2;

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
        expect(vesting[5]).to.equal("0");
    });

    it("Create vesting with zero token should revert", async function () {
        await expect(this.vestingFactory.deploy(ZERO_ADDRESS)).to.be.revertedWith("token address cannot be zero");
    });

    describe("Create vesting", function () {
        describe("reverts", function () {
            it("when interval = 0", async function () {
                await expect(this.vesting.createVesting(this.deployer.address, vestingStartDate, cliff, 0, duration, balance)).to.be.revertedWith(
                    "TokenVesting #createVesting: interval must be greater than 0"
                );
            });
            it("when interval > duration", async function () {
                await expect(this.vesting.createVesting(this.deployer.address, vestingStartDate, cliff, interval + 1, interval, balance)).to.be.revertedWith(
                    "TokenVesting #createVesting: interval cannot be bigger than duration"
                );
            });
            it("when cliff < start", async function () {
                await expect(this.vesting.createVesting(this.deployer.address, vestingStartDate, vestingStartDate - 1, interval, duration, balance)).to.be.revertedWith(
                    "TokenVesting #createVesting: cliff must be greater or equal to start"
                );
            });
            it("when cliff >= start + duration", async function () {
                await expect(this.vesting.createVesting(this.deployer.address, vestingStartDate, vestingStartDate + duration, interval, duration, balance)).to.be.revertedWith(
                    "TokenVesting #createVesting: cliff exceeds duration"
                );
            });
            it("when current balance > 0", async function () {
                // Create vesting for user
                await this.vesting.createVesting(this.deployer.address, vestingStartDate, cliff, interval, duration, balance);
                // Try to create another vesting
                await expect(this.vesting.createVesting(this.deployer.address, vestingStartDate, cliff, interval, duration, balance)).to.be.revertedWith(
                    "TokenVesting #createVesting: vesting for beneficiary already created"
                );
            });
        });

        describe("Check vesting after intervals", function () {
            beforeEach("Create vesting", async function () {
                await this.vesting.createVesting(this.deployer.address, vestingStartDate, cliff, interval, duration, balance);
            });
            it("Check vesting before start, should return zero", async function () {
                expect(await this.vesting.vestedAmount(this.deployer.address)).to.be.equal(0);
            });

            it("Check vesting after 1 interval", async function () {
                const intervalNumber = 1;
                let currentVestingData = await this.vesting.getVesting(this.deployer.address);
                let currentVestingStartDate = Number(currentVestingData[0]);
                let currentCliff = Number(currentVestingData[1]);
                expect(currentCliff).to.be.greaterThan(currentVestingStartDate);
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
                await this.vesting.createVesting(this.deployer.address, vestingStartDate, cliff, interval, duration, balance);
            });

            it("Check unreleased 0<, nothing to release", async function () {
                let currentVestingData = await this.vesting.getVesting(this.deployer.address);
                const currentVestingStartDate = Number(currentVestingData[0]);
                await this.vesting.setCurrentBlockTime(currentVestingStartDate - 1);
                await expect(this.vesting.release(this.deployer.address)).to.be.revertedWith("TokenVesting #release: nothing to release");
            });

            it("Check release before cliff", async function () {
                let currentVestingData = await this.vesting.getVesting(this.deployer.address);
                const currentCliff = Number(currentVestingData[1]);
                await this.vesting.setCurrentBlockTime(currentCliff - 1);
                await expect(this.vesting.release(this.deployer.address)).to.be.revertedWith("TokenVesting #release: before cliff date");
            });

            it("Check release after cliff", async function () {
                let currentVestingData = await this.vesting.getVesting(this.deployer.address);
                let currentCliff = Number(currentVestingData[1]);
                const balanceBefore = await this.token.balanceOf(this.deployer.address);
                const releasableAmountBeforeTimeChange = await this.vesting.releasableAmount(this.deployer.address);
                expect(releasableAmountBeforeTimeChange).to.equal(0);

                await this.vesting.setCurrentBlockTime(currentCliff);
                const releasableAmount = await this.vesting.releasableAmount(this.deployer.address);

                await expect(this.vesting.release(this.deployer.address))
                    .to.emit(this.vesting, "Released").withArgs(releasableAmount);
                const expectedBalance = BigInt(balanceBefore) + BigInt(releasableAmount)
                expect(await this.token.balanceOf(this.deployer.address)).to.be.equal(expectedBalance);
            });

            it("Check release after cliff and 2 intervals", async function () {
                const intervalsAfterCliff = 2;
                const currentVestingData = await this.vesting.getVesting(this.deployer.address);

                const currentVestingStartDate = Number(currentVestingData[0]);
                const currentCliff = Number(currentVestingData[1]);
                const currentInterval = ethers.BigNumber.from(currentVestingData[2]);
                const currentDuration = ethers.BigNumber.from(currentVestingData[3]);
                const currentBalance = ethers.BigNumber.from(currentVestingData[4]);
                const currentReleased = ethers.BigNumber.from(currentVestingData[5]);

                const currentTotalIntervals = currentDuration.div(currentInterval);

                const balanceBefore = await this.token.balanceOf(this.deployer.address);

                const releasableAmountBeforeTimeChange = await this.vesting.releasableAmount(this.deployer.address);
                expect(releasableAmountBeforeTimeChange).to.be.equal(0);

                // Two intervals after cliff
                await this.vesting.setCurrentBlockTime(currentCliff + currentInterval * intervalsAfterCliff);

                const intervalsPassBeforeCliff = ethers.BigNumber.from(currentCliff - currentVestingStartDate)
                    .div(currentInterval);
                const totalIntervalsPass = intervalsPassBeforeCliff.add(intervalsAfterCliff);

                const expectedReleasableAmount = currentBalance
                    .sub(currentReleased)
                    .mul(totalIntervalsPass)
                    .div(currentTotalIntervals);

                const releasableAmount = await this.vesting.releasableAmount(this.deployer.address);
                expect(releasableAmount.sub(releasableAmountBeforeTimeChange))
                    .to.equal(expectedReleasableAmount.sub(releasableAmountBeforeTimeChange));

                await expect(this.vesting.release(this.deployer.address))
                    .to.emit(this.vesting, "Released").withArgs(releasableAmount);
                expect(await this.token.balanceOf(this.deployer.address))
                    .to.be.equal(balanceBefore.add(releasableAmount));

                const vestingDataAfterRelease = await this.vesting.getVesting(this.deployer.address);
                const currentVestingStartDateAfterRelease = Number(vestingDataAfterRelease[0]);
                const currentCliffAfterRelease = Number(vestingDataAfterRelease[1]);
                const currentIntervalAfterRelease = ethers.BigNumber.from(vestingDataAfterRelease[2]);
                const currentDurationAfterRelease = ethers.BigNumber.from(vestingDataAfterRelease[3]);
                const currentBalanceAfterRelease = ethers.BigNumber.from(vestingDataAfterRelease[4]);
                const currentReleasedAfterRelease = ethers.BigNumber.from(vestingDataAfterRelease[5]);

                expect(currentVestingStartDate).to.be.equal(currentVestingStartDateAfterRelease)
                expect(currentCliff).to.be.equal(currentCliffAfterRelease)
                expect(currentInterval.eq(currentIntervalAfterRelease))
                expect(currentDuration.eq(currentDurationAfterRelease))

                expect(currentBalance.gt(currentBalanceAfterRelease))
                expect(currentReleased.lt(currentReleasedAfterRelease))

                const expectedVestedAmountAfterRelease = currentBalanceAfterRelease
                    .add(currentReleasedAfterRelease)
                    .mul(totalIntervalsPass)
                    .div(currentDuration.div(currentInterval))
                    .sub(releasableAmountBeforeTimeChange)
                    .sub(currentReleased);

                expect(await this.vesting.vestedAmount(this.deployer.address)).to.equal(expectedVestedAmountAfterRelease);
                expect(await this.vesting.releasableAmount(this.deployer.address))
                    .to.equal(expectedVestedAmountAfterRelease.sub(currentReleasedAfterRelease));
            });

            it("Check releasableAmount after duration, should return total amount", async function () {
                let currentVestingData = await this.vesting.getVesting(this.deployer.address);
                let currentVestingStartDate = Number(currentVestingData[0]);
                await this.vesting.setCurrentBlockTime(currentVestingStartDate + duration);
                const releasableAmount = await this.vesting.releasableAmount(this.deployer.address);
                expect(releasableAmount).to.equal(balance);
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
