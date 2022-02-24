const { expect } = require("chai");
const { ethers } = require("hardhat");

function calculateReleasableAmount(start, now, interval, duration, amount) {
    const passedIntervals = Math.floor((now - start) / interval);
    const totalIntervals = Math.floor(duration / interval);
    return Math.floor(amount * passedIntervals / totalIntervals);
}

describe("TokenVesting", function () {
    this.beforeEach(async function () {
        const MetarunToken = await ethers.getContractFactory("MetarunToken");
        const TokenVesting = await ethers.getContractFactory("TokenVestingMock");
        this.signers = await ethers.getSigners();

        this.token = await MetarunToken.deploy();
        this.vesting = await TokenVesting.deploy(this.token.address);

        this.deployer = this.signers[0];
        this.deployerAddress = this.deployer.address;

        this.beneficiary = this.signers[1];
        this.beneficiaryAddress = this.beneficiary.address;

        // Time and amount configuration
        this.zeroPoint = 1;
        this.start = 10;
        this.cliff = 20;
        this.interval = 2;
        this.duration = 30;
        this.amount = 500;

        // Vesting token balance
        await this.token.mint(this.deployerAddress, this.amount);
        await this.token.approve(this.vesting.address, this.amount);

        await this.vesting.createVesting(
            this.beneficiaryAddress,
            this.start,
            this.cliff,
            this.interval,
            this.duration,
            this.amount
        );

    });

    describe("Behavior before vesting's start", function () {
        this.beforeEach(async function () {
            await this.vesting.setCurrentBlockTime(this.zeroPoint);
        });

        it("should give releasable amount = 0", async function () {
            const releasableAmount = await this.vesting.releasableAmount(this.beneficiaryAddress);
            expect(releasableAmount).to.be.eq(0);
        });

        it("should release nothing before the start", async function () {
            await expect(this.vesting.release(this.beneficiaryAddress)).to.be.revertedWith("TokenVesting #release: nothing to release");
        });

    });

    describe("Behavior before cliff", function () {
        this.beforeEach(async function () {
            await this.vesting.setCurrentBlockTime(this.start);
        });

        it("should give releasable amount = 0", async function () {
            const releasableAmount = await this.vesting.releasableAmount(this.beneficiaryAddress);
            expect(releasableAmount).to.be.eq(0);
        });

        it("should release nothing before the start", async function () {
            await expect(this.vesting.release(this.beneficiaryAddress)).to.be.revertedWith("TokenVesting #release: nothing to release");
        });
    });

    describe("Behavior after cliff", function () {
        this.beforeEach(async function () {
            await this.vesting.setCurrentBlockTime(this.cliff);
            this.currentTime = this.cliff;
            this.expectedReleasableAmount = calculateReleasableAmount(
                this.start,
                this.currentTime,
                this.interval,
                this.duration,
                this.amount
            );
        });

        it("should give releasable amount properly", async function () {
            const actualReleasableAmount = await this.vesting.releasableAmount(this.beneficiaryAddress);
            expect(actualReleasableAmount).to.be.eq(this.expectedReleasableAmount);
        });

        it("should release this amount successfully", async function () {
            await this.vesting.release(this.beneficiaryAddress);
            const changedBalance = await this.token.balanceOf(this.beneficiaryAddress);
            expect(changedBalance).to.be.eq(this.expectedReleasableAmount);
        });

    });

    describe("Behavior after cliff + 1 interval", async function () {
        this.beforeEach(async function () {
            this.currentTime = this.cliff + this.interval;
            await this.vesting.setCurrentBlockTime(this.currentTime);
            this.expectedReleasableAmount = calculateReleasableAmount(
                this.start,
                this.currentTime,
                this.interval,
                this.duration,
                this.amount
            );

        });

        it("should have proper amount vested", async function () {
            const vestedAmount = await this.vesting.vestedAmount(this.beneficiaryAddress);
            expect(vestedAmount).to.be.eq(this.expectedReleasableAmount);
        });

        it("should have proper releasable amount", async function () {
            const releasableAmount = await this.vesting.releasableAmount(this.beneficiaryAddress);
            expect(releasableAmount).to.be.eq(this.expectedReleasableAmount);
        });

        it("should release amount properly", async function () {
            await this.vesting.release(this.beneficiaryAddress);
            const balance = await this.token.balanceOf(this.beneficiaryAddress);
            expect(balance).to.be.eq(this.expectedReleasableAmount);
        });

    });

    describe("Behavior after cliff + 1/2 interval", async function () {
        this.beforeEach(async function () {
            this.currentTime = this.cliff + Math.floor(this.interval / 2);
            await this.vesting.setCurrentBlockTime(this.currentTime);
            this.expectedReleasableAmount = calculateReleasableAmount(
                this.start,
                this.currentTime,
                this.interval,
                this.duration,
                this.amount
            );
        });

        it("should have proper amount vested", async function () {
            const vestedAmount = await this.vesting.vestedAmount(this.beneficiaryAddress);
            expect(vestedAmount).to.be.eq(this.expectedReleasableAmount);
        });

        it("should have proper releasable amount", async function () {
            const releasableAmount = await this.vesting.releasableAmount(this.beneficiaryAddress);
            expect(releasableAmount).to.be.eq(this.expectedReleasableAmount);
        });

        it("should release amount properly", async function () {
            await this.vesting.release(this.beneficiaryAddress);
            const balance = await this.token.balanceOf(this.beneficiaryAddress);
            expect(balance).to.be.eq(this.expectedReleasableAmount);
        });

    });

    describe("Behavior after vesting ended", function () {
        this.beforeEach(async function () {
            const end = this.start + this.duration;
            await this.vesting.setCurrentBlockTime(end);
        });

        it("should have amount vested equal to total", async function () {
            const actualVestedAmount = await this.vesting.vestedAmount(this.beneficiaryAddress);
            expect(actualVestedAmount).to.be.eq(this.amount);

        });

        it("should have releasable amount equal to total", async function () {
            const actualReleasableAmount = await this.vesting.releasableAmount(this.beneficiaryAddress);
            expect(actualReleasableAmount).to.be.eq(this.amount);
        });

        it("should release total amount", async function () {
            await this.vesting.release(this.beneficiaryAddress);
            const changedBalance = await this.token.balanceOf(this.beneficiaryAddress);
            expect(changedBalance).to.be.eq(this.amount);
        });

    });

    describe("Behavior on creating new vesting", function () {
        describe("Reverts", function () {
            this.beforeAll(async function () {
                this.dummyBeneficiary = this.signers[2];
                this.dummyBeneficiaryAddress = this.dummyBeneficiary.address;

            });

            it("when interval is 0", async function () {
                const creation = this.vesting.createVesting(
                    this.dummyBeneficiaryAddress,
                    this.start,
                    this.cliff,
                    0,
                    this.duration,
                    this.amount
                );
                await expect(creation).to.be.revertedWith("TokenVesting #createVesting: interval must be greater than 0");
            });

            it("when interval is greater than duration", async function () {
                const creation = this.vesting.createVesting(
                    this.dummyBeneficiaryAddress,
                    this.start,
                    this.cliff,
                    this.duration + 100,
                    this.duration,
                    this.amount
                );
                await expect(creation).to.be.revertedWith("TokenVesting #createVesting: interval cannot be bigger than duration");
            });

            it("when cliff is before start", async function () {
                const creation = this.vesting.createVesting(
                    this.dummyBeneficiaryAddress,
                    this.start,
                    this.start - 1,
                    this.interval,
                    this.duration,
                    this.amount
                );
                await expect(creation).to.be.revertedWith("TokenVesting #createVesting: cliff must be greater or equal to start");
            });

            it("when cliff is bigger than ending of vesting", async function () {
                const creation = this.vesting.createVesting(
                    this.dummyBeneficiaryAddress,
                    this.start,
                    this.start + this.duration + 1,
                    this.interval,
                    this.duration,
                    this.amount
                );
                await expect(creation).to.be.revertedWith("TokenVesting #createVesting: cliff exceeds duration");
            });

            it("when vesting already exists", async function () {
                await this.token.mint(this.dummyBeneficiaryAddress, this.amount);
                await this.token.connect(this.dummyBeneficiary).approve(this.vesting.address, this.amount);
                const dummyBeneficiaryBalance = await this.token.balanceOf(this.dummyBeneficiaryAddress);
                await this.vesting.connect(this.dummyBeneficiary).createVesting(
                    this.dummyBeneficiaryAddress,
                    this.start,
                    this.cliff,
                    this.interval,
                    this.duration,
                    1
                );
                const dummyCreation = this.vesting.connect(this.dummyBeneficiary).createVesting(
                    this.dummyBeneficiaryAddress,
                    this.start,
                    this.cliff,
                    this.interval,
                    this.duration,
                    1
                );

                await expect(dummyCreation).to.be.revertedWith("TokenVesting #createVesting: vesting for beneficiary already created");
            });
        });
    });

});