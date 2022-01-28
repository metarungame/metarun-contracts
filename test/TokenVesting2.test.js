const {expect} = require("chai");
const {ethers, network} = require("hardhat");


describe("Metarun Token Vesting", function () {
    const initialSupply = ethers.utils.parseUnits("1000000");
    let vestingStartDate;
    const DAY = 60 * 60 * 24;
    const MONTH = DAY * 30;
    const interval = 3600;
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
        this.vestingFactory = await ethers.getContractFactory("TokenVesting");
        this.token = await this.tokenFactory.deploy();
        await this.token.mint(this.deployer.address, initialSupply);
        this.vesting = await this.vestingFactory.deploy(this.token.address);
        this.token.approve(this.vesting.address, initialSupply);
    });
    it("getter returns zeroes for unconfigured vestings", async function () {
        const vesting = await this.vesting.getVesting(this.stranger.address);
        expect(vesting[0]).to.equal("0");
        expect(vesting[1]).to.equal("0");
        expect(vesting[2]).to.equal("0");
        expect(vesting[3]).to.equal("0");
        expect(vesting[4]).to.equal("0");
    });

    describe("Create vesting", function () {
        beforeEach("createVesting", async function () {
            await this.vesting.createVesting(this.deployer.address, vestingStartDate, interval, duration, balance);
        });
        it("vesting should have correct data", async function () {
            const vesting = await this.vesting.getVesting(this.deployer.address);
            expect(vesting[0]).to.equal(vestingStartDate);
            expect(vesting[1]).to.equal(interval);
            expect(vesting[2]).to.equal(duration);
            expect(vesting[3]).to.equal(balance);
            expect(vesting[4]).to.equal("0");
        });
        it("reverts when nothing to release", async function () {
            await expect(this.vesting.release(this.deployer.address)).to.be.revertedWith("TokenVesting #release: nothing to release");
        });
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
                await expect(this.vesting.createVesting(this.deployer.address, vestingStartDate, interval, duration, balance)).to.be.revertedWith(
                    "TokenVesting #createVesting: vesting for beneficiary already created"
                );
            });
        });
        describe(`Vesting not started yet`, function () {
            it("Vesting amount is Zero", async function () {
                const vestedAmount = await this.vesting.vestedAmount(this.deployer.address);
                expect(vestedAmount).to.equal(0);
            });
        });

        describe(`Vesting started 1 interval pass`, function () {
            const intervalNumber = 1;
            beforeEach("1 interval pass", async function () {
                await network.provider.send("evm_mine", [vestingStartDate + interval * intervalNumber]);
            });
            it("should vested 1 interval", async function () {
                const vestedAmount = await this.vesting.vestedAmount(this.deployer.address);
                const intervalsVestedBN = ethers.BigNumber.from(ethAmount * intervalNumber);
                const durationBN = ethers.BigNumber.from(duration);
                const intervalBN = ethers.BigNumber.from(interval);
                const expectedVestedAmount = balance.mul(intervalsVestedBN).div(durationBN.div(intervalBN));
                expect(vestedAmount).to.equal(expectedVestedAmount);
            });
            it("should release token for 1 interval", async function () {
                const releasableAmount = await this.vesting.releasableAmount(this.deployer.address);

                const openBalBeneficiary = await this.token.balanceOf(this.deployer.address);
                const openBalVestingContract = await this.token.balanceOf(this.vesting.address);
                const openBalVesting = ethers.BigNumber.from((await this.vesting.getVesting(this.deployer.address))[3]);

                const intervalsVestedBN = ethers.BigNumber.from(ethAmount * intervalNumber);
                const durationBN = ethers.BigNumber.from(duration);
                const intervalBN = ethers.BigNumber.from(interval);
                const expectedReleasableAmount = balance.mul(intervalsVestedBN).div(durationBN.div(intervalBN));

                await expect(this.vesting.release(this.deployer.address))
                    .to.emit(this.vesting, 'Released')
                    .withArgs(releasableAmount);

                const closeBalBeneficiary = await this.token.balanceOf(this.deployer.address);
                const closeBalVestingContract = await this.token.balanceOf(this.vesting.address);
                const closeBalVesting = ethers.BigNumber.from((await this.vesting.getVesting(this.deployer.address))[3]);

                expect(releasableAmount).to.equal(expectedReleasableAmount);
                expect(closeBalBeneficiary).to.equal(openBalBeneficiary.add(releasableAmount));
                expect(closeBalVestingContract).to.equal(openBalVestingContract.sub(releasableAmount));
                expect(closeBalVesting).to.equal(openBalVesting.sub(releasableAmount));
            });
        });
        describe(`Vesting started 2 intervals pass`, function () {
            const intervalNumber = 2;
            beforeEach('2 intervals pass', async function () {
                await network.provider.send("evm_mine", [vestingStartDate + interval * intervalNumber]);
            });
            it("should vested 2 intervals", async function () {
                const vestedAmount = await this.vesting.vestedAmount(this.deployer.address);
                const intervalsVestedBN = ethers.BigNumber.from(ethAmount * intervalNumber);
                const durationBN = ethers.BigNumber.from(duration);
                const intervalBN = ethers.BigNumber.from(interval);
                const expectedVestedAmount = balance.mul(intervalsVestedBN).div(durationBN.div(intervalBN));
                expect(vestedAmount).to.equal(expectedVestedAmount);
            });
            it("should release token for 2 intervals", async function () {
                const releasableAmount = await this.vesting.releasableAmount(this.deployer.address);

                const intervalsVestedBN = ethers.BigNumber.from(ethAmount * intervalNumber);
                const durationBN = ethers.BigNumber.from(duration);
                const intervalBN = ethers.BigNumber.from(interval);
                const expectedReleasableAmount = balance.mul(intervalsVestedBN).div(durationBN.div(intervalBN));

                const openBalBeneficiary = await this.token.balanceOf(this.deployer.address);
                const openBalVestingContract = await this.token.balanceOf(this.vesting.address);
                const openBalVesting = ethers.BigNumber.from((await this.vesting.getVesting(this.deployer.address))[3]);

                await expect(this.vesting.release(this.deployer.address))
                    .to.emit(this.vesting, 'Released')
                    .withArgs(releasableAmount);

                const closeBalBeneficiary = await this.token.balanceOf(this.deployer.address);
                const closeBalVestingContract = await this.token.balanceOf(this.vesting.address);
                const closeBalVesting = ethers.BigNumber.from((await this.vesting.getVesting(this.deployer.address))[3]);

                expect(releasableAmount).to.equal(expectedReleasableAmount);
                expect(closeBalBeneficiary).to.equal(openBalBeneficiary.add(releasableAmount));
                expect(closeBalVestingContract).to.equal(openBalVestingContract.sub(releasableAmount));
                expect(closeBalVesting).to.equal(openBalVesting.sub(releasableAmount));
            });
        });
        describe(`Vesting started 3 intervals pass`, function () {
            const intervalNumber = 3;
            beforeEach('3 intervals pass', async function () {
                await network.provider.send("evm_mine", [vestingStartDate + interval * intervalNumber]);
            });
            it("should vested 3 intervals", async function () {
                const vestedAmount = await this.vesting.vestedAmount(this.deployer.address);
                const intervalsVestedBN = ethers.BigNumber.from(ethAmount * intervalNumber);
                const durationBN = ethers.BigNumber.from(duration);
                const intervalBN = ethers.BigNumber.from(interval);
                const expectedVestedAmount = balance.mul(intervalsVestedBN).div(durationBN.div(intervalBN));
                expect(vestedAmount).to.equal(expectedVestedAmount);
            });
            it("should release token for 3 intervals", async function () {
                const releasableAmount = await this.vesting.releasableAmount(this.deployer.address);

                const openBalBeneficiary = await this.token.balanceOf(this.deployer.address);
                const openBalVestingContract = await this.token.balanceOf(this.vesting.address);
                const openBalVesting = ethers.BigNumber.from((await this.vesting.getVesting(this.deployer.address))[3]);

                const intervalsVestedBN = ethers.BigNumber.from(ethAmount * intervalNumber);
                const durationBN = ethers.BigNumber.from(duration);
                const intervalBN = ethers.BigNumber.from(interval);
                const expectedReleasableAmount = balance.mul(intervalsVestedBN).div(durationBN.div(intervalBN));

                await expect(this.vesting.release(this.deployer.address))
                    .to.emit(this.vesting, 'Released')
                    .withArgs(releasableAmount);

                const closeBalBeneficiary = await this.token.balanceOf(this.deployer.address);
                const closeBalVestingContract = await this.token.balanceOf(this.vesting.address);
                const closeBalVesting = ethers.BigNumber.from((await this.vesting.getVesting(this.deployer.address))[3]);

                expect(releasableAmount).to.equal(expectedReleasableAmount);
                expect(closeBalBeneficiary).to.equal(openBalBeneficiary.add(releasableAmount));
                expect(closeBalVestingContract).to.equal(openBalVestingContract.sub(releasableAmount));
                expect(closeBalVesting).to.equal(openBalVesting.sub(releasableAmount));
            });
        });

        describe(`postpone vesting`, function () {
            let newStart = vestingStartDate + interval * 3;
            let wrongNewStart = vestingStartDate - 1;
            describe("reverts", function () {
                it("when balance is 0 (vesting not extists)", async function () {
                    await expect(this.vesting.connect(this.stranger).postponeVesting(newStart)).to.be.revertedWith(
                        "TokenVesting #postponeVesting: vesting for beneficiary does not exist"
                    );
                });

            });
        });


    });

});
