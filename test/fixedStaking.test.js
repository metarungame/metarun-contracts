const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const { BigNumber } = require("ethers");

const days = BigNumber.from("60").mul("60").mul("24");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const stakeDuration30Days = 30 * 60 * 60 * 24;
const stakeDuration90Days = 90 * 60 * 60 * 24;

const URI_TOKEN = "localhost/api/{id}.json";

describe("FixedStaking", function () {
  before(async function () {
    this.signers = await ethers.getSigners();
    this.alice = this.signers[0];
    this.bob = this.signers[1];
    this.tokenFactory = await ethers.getContractFactory("MetarunToken");
    this.nftCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.contract = await ethers.getContractFactory("FixedStakingMock");
  });

  describe("30 days, 1.55% interest, 1.55% penalty", function () {
    const initialSupply = ethers.utils.parseUnits("3600000");
    beforeEach(async function () {
      this.token = await this.tokenFactory.deploy();
      await this.token.deployed();
      await this.token.mint(this.alice.address, initialSupply);
      this.nftCollection = await upgrades.deployProxy(this.nftCollectionFactory, [URI_TOKEN]);
      await this.nftCollection.deployed();
      this.pool = await this.contract.deploy(this.token.address, stakeDuration30Days, 155, 155, this.nftCollection.address);
      await this.pool.deployed();
      await this.pool.setCurrentTime(0);
      await this.token.grantRole(await this.token.MINTER_ROLE(), this.pool.address);
      await this.nftCollection.grantRole(await this.nftCollection.MINTER_ROLE(), this.pool.address);
    });

    it("initial states", async function () {
      const deployed = await this.pool.deployed();
      expect(deployed, true);
      expect(await this.pool.owner()).to.equal(this.alice.address);
      expect(await this.pool.stakesOpen()).to.equal(false);
      expect(await this.pool.stakeDuration()).to.equal(stakeDuration30Days);
      expect(await this.pool.yieldRate()).to.equal("155");
      expect(await this.pool.earlyUnstakeFee()).to.equal("155");
      expect(await this.pool.stakedTokens()).to.equal("0");
      expect(await this.pool.getStakesLength(this.alice.address)).to.equal("0");
      expect(await this.pool.mrunPerSkin()).to.equal("0");
      expect(await this.pool.skinKind()).to.equal("0");
      expect(await this.token.balanceOf(this.alice.address)).to.equal(BigNumber.from("3600000").mul(BigNumber.from(10).pow(18)));
    });

    it("Get now check", async function () {
      const deployed = await this.pool.deployed();
    });

    describe("Set mrunPerSkin", async function () {
      beforeEach(async function () {
        await this.pool.setMrunPerSkin(1000);
      });
      it("mrunPerSkin changed value", async function () {
        expect(await this.pool.mrunPerSkin()).not.to.equal("0");
        expect(await this.pool.mrunPerSkin()).to.equal("1000");
      });
    });

    it("should revert when Stakes are not started yet", async function () {
      await expect(this.pool.stop()).to.be.revertedWith("Stakes are stopped already");
    });

    it("should revert when start () is called without set skinKind", async function () {
      await expect(this.pool.start()).to.be.revertedWith("skinKind variable not set");
    });

    describe("Start staking", async function () {
      beforeEach(async function () {
        await this.pool.setSkinKind(0x0300);
        await this.pool.start();
      });

      it("should revert when start () is called again", async function () {
        await expect(this.pool.start()).to.be.revertedWith("Stakes are open already");
      });

      it("check skinKind value", async function () {
        expect(await this.pool.skinKind()).to.equal(0x0300);
      });

      describe("Owner added reward token on the contract", async function () {
        beforeEach(async function () {
          reward = BigNumber.from("10000").mul("155").div("10000");
          secondReward = BigNumber.from("20000").mul("155").div("10000");
          fee1 = reward;
          fee2 = secondReward;
          totalReward = reward.add(secondReward);
        });

        it("should revert if stake without approve", async function () {
          await expect(this.pool.stake(10000)).to.be.revertedWith("ERC20: insufficient allowance");
        });

        it("Stop() called by owner closes stakes", async function () {
          await this.pool.stop();
          expect(await this.pool.stakesOpen()).to.equal(false);
        });

        it("should revert if the contract address is zero", async function () {
          await expect(this.contract.deploy(ZERO_ADDRESS, 30, 155, 155, this.nftCollection.address)).to.be.revertedWith("Empty token address");
        });

        it("should revert if the yield rate is zero", async function () {
          await expect(this.contract.deploy(this.token.address, 30, 0, 155, this.nftCollection.address)).to.be.revertedWith("Zero yield rate");
        });

        it("should revert if the early unstake fee is zero", async function () {
          await expect(this.contract.deploy(this.token.address, 30, 155, 0, this.nftCollection.address)).to.be.revertedWith(
            "Zero early Unstake Fee"
          );
        });

        describe("Try stake with different mrunPerSkin", function () {
          beforeEach(async function () {
            aliceInitBalance = BigNumber.from(await this.token.balanceOf(this.alice.address));
            await this.token.approve(this.pool.address, 1000000);
          });

          it("Stake should revert if reward greater than 100", async function () {
            await this.pool.setMrunPerSkin(10);
            await expect(this.pool.stake(10000)).to.be.revertedWith("stake: reward skins can't be greater than 100");
          });

          it("Stake should revert if reward equal than 100", async function () {
            const stakeId = 0;
            const depositAmount = 1000;
            const startTime = 0;
            const endTime = 30 * 24 * 60 * 60;
            await this.pool.setMrunPerSkin(10);
            await expect(await this.pool.stake(depositAmount))
              .to.emit(this.pool, "Stake")
              .withArgs(this.alice.address, stakeId, depositAmount, startTime, endTime);
          });
        });

        describe("Alice staked", function () {
          beforeEach(async function () {
            aliceInitBalance = BigNumber.from(await this.token.balanceOf(this.alice.address));
            await this.token.approve(this.pool.address, 1000000);

            stake1 = await this.pool.stake(10000);
          });

          it("emits event Transfer on staking", async function () {
            await expect(stake1).to.emit(this.token, "Transfer").withArgs(this.alice.address, this.pool.address, 10000);
          });

          it("emits event Stake", async function () {
            const stakeId = 0;
            const depositAmount = 10000;
            const startTime = 0;
            const endTime = 30 * 24 * 60 * 60;

            await expect(stake1).to.emit(this.pool, "Stake").withArgs(this.alice.address, stakeId, depositAmount, startTime, endTime);
          });

          it("Stake should revert if stakes are not open", async function () {
            await this.pool.stop();
            await expect(this.pool.stake(10900)).to.be.revertedWith("stake: not open");
          });

          it("Non-owner can't stop staking", async function () {
            await expect(this.pool.connect(this.bob).stop()).to.be.revertedWith("Ownable: caller is not the owner");
          });

          it("getStakingLength and pool token balance increased", async function () {
            expect(await this.pool.getStakesLength(this.alice.address)).to.equal("1");
            expect(await this.token.balanceOf(this.pool.address)).to.equal(BigNumber.from(10000));

            expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.sub(10000));
          });

          it("check stake details", async function () {
            expect((await this.pool.getStake(this.alice.address, 0)).staked).to.equal(true);
            expect((await this.pool.getStake(this.alice.address, 0)).stakedAmount).to.equal("10000");
            expect((await this.pool.getStake(this.alice.address, 0)).startTime).to.equal(0);
            expect((await this.pool.getStake(this.alice.address, 0)).endTime).to.equal(days.mul("30"));
            expect((await this.pool.getStake(this.alice.address, 0)).totalYield).to.equal(reward);
            expect((await this.pool.getStake(this.alice.address, 0)).harvestedYield).to.equal("0");
            expect((await this.pool.getStake(this.alice.address, 0)).lastHarvestTime).to.equal(
              (await this.pool.getStake(this.alice.address, 0)).startTime
            );
            expect((await this.pool.getStake(this.alice.address, 0)).harvestableYield).to.equal("0");
            expect((await this.pool.getStake(this.alice.address, 0)).skinsAmount).to.equal("0");
          });

          it("check reward skins after set mrunPerSkin on Alice's first stake", async function () {
            await this.pool.setMrunPerSkin(1000);
            expect((await this.pool.getStake(this.alice.address, 0)).skinsAmount).to.equal("10");
          });

          describe("second stake of Alice", function () {
            beforeEach(async function () {
              stake2 = await this.pool.stake(20000);
            });

            it("emits event Transfer on staking", async function () {
              await expect(stake2).to.emit(this.token, "Transfer").withArgs(this.alice.address, this.pool.address, 20000);
            });
            it("emits event Stake", async function () {
              const stakeId = 1;
              const depositAmount = 20000;
              const startTime = 0;
              const endTime = 30 * 24 * 60 * 60;

              await expect(stake2).to.emit(this.pool, "Stake").withArgs(this.alice.address, stakeId, depositAmount, startTime, endTime);
            });

            it("check stakes length and token balance", async function () {
              expect(await this.pool.stakedTokens()).to.equal("30000");
              expect(await this.pool.getStakesLength(this.alice.address)).to.equal("2");
              expect(await this.token.balanceOf(this.pool.address)).to.equal(BigNumber.from(30000));
            });

            it("check details of Alice's second stake", async function () {
              expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.sub(10000).sub(20000));
              expect((await this.pool.getStake(this.alice.address, 1)).staked).to.equal(true);
              expect((await this.pool.getStake(this.alice.address, 1)).stakedAmount).to.equal("20000");
              expect((await this.pool.getStake(this.alice.address, 1)).startTime).to.equal("0");
              expect((await this.pool.getStake(this.alice.address, 1)).endTime).to.equal(days.mul("30"));
              expect((await this.pool.getStake(this.alice.address, 1)).totalYield).to.equal(secondReward);
              expect((await this.pool.getStake(this.alice.address, 1)).harvestedYield).to.equal("0");
              expect((await this.pool.getStake(this.alice.address, 1)).lastHarvestTime).to.equal(
                (await this.pool.getStake(this.alice.address, 1)).startTime
              );
              expect((await this.pool.getStake(this.alice.address, 1)).harvestableYield).to.equal("0");
              expect((await this.pool.getStake(this.alice.address, 1)).skinsAmount).to.equal("0");
            });

            it("check reward skins after set mrunPerSkin on Alice's second stake", async function () {
              await this.pool.setMrunPerSkin(1000);
              expect((await this.pool.getStake(this.alice.address, 1)).skinsAmount).to.equal("20");
            });
            describe("15 days (half) passed", function () {
              beforeEach(async function () {
                await this.pool.increaseCurrentTime(days.mul("15"));
              });

              it("her stake is correct", async function () {
                expect((await this.pool.getStake(this.alice.address, 0)).staked).to.equal(true);
                expect((await this.pool.getStake(this.alice.address, 0)).stakedAmount).to.equal("10000");
                expect((await this.pool.getStake(this.alice.address, 0)).startTime).to.equal("0");
                expect((await this.pool.getStake(this.alice.address, 0)).endTime).to.equal(days.mul("30"));
                expect((await this.pool.getStake(this.alice.address, 0)).totalYield).to.equal(reward);
                expect((await this.pool.getStake(this.alice.address, 0)).harvestedYield).to.equal("0");
                expect((await this.pool.getStake(this.alice.address, 0)).lastHarvestTime).to.equal(
                  (await this.pool.getStake(this.alice.address, 0)).startTime
                );
                expect((await this.pool.getStake(this.alice.address, 0)).harvestableYield).to.equal(reward.div(2));
                expect((await this.pool.getStake(this.alice.address, 0)).skinsAmount).to.equal("0");

                expect((await this.pool.getStake(this.alice.address, 1)).staked).to.equal(true);
                expect((await this.pool.getStake(this.alice.address, 1)).stakedAmount).to.equal("20000");
                expect((await this.pool.getStake(this.alice.address, 1)).startTime).to.equal("0");
                expect((await this.pool.getStake(this.alice.address, 1)).endTime).to.equal(days.mul("30"));
                expect((await this.pool.getStake(this.alice.address, 1)).totalYield).to.equal(secondReward);
                expect((await this.pool.getStake(this.alice.address, 1)).harvestedYield).to.equal("0");
                expect((await this.pool.getStake(this.alice.address, 1)).lastHarvestTime).to.equal(
                  (await this.pool.getStake(this.alice.address, 1)).startTime
                );
                expect((await this.pool.getStake(this.alice.address, 1)).harvestableYield).to.equal(secondReward.div("2"));
                expect((await this.pool.getStake(this.alice.address, 1)).skinsAmount).to.equal("0");
              });

              describe("early unstake first deposit", function () {
                beforeEach(async function () {
                  unstake1 = await this.pool.unstake(0);
                });

                it("emits event Transfer on unstaking", async function () {
                  await expect(unstake1)
                    .to.emit(this.token, "Transfer")
                    .withArgs(this.pool.address, this.alice.address, BigNumber.from(10000).sub(fee1));
                });

                it("emits event Unstake", async function () {
                  const stakeId = 0;
                  const depositAmount = 10000;
                  const startTime = 0;
                  const endTime = 30 * 24 * 60 * 60;
                  const earlyStake = true;

                  await expect(unstake1)
                    .to.emit(this.pool, "Unstake")
                    .withArgs(this.alice.address, stakeId, depositAmount, startTime, endTime, earlyStake);
                });

                it("fee stays on pool balance", async function () {
                  expect(await this.pool.stakedTokens()).to.equal(BigNumber.from(20000));
                  expect(await this.pool.getStakesLength(this.alice.address)).to.equal("2");
                  expect(await this.token.balanceOf(this.pool.address)).to.equal(BigNumber.from(20000));
                });

                it("her stake is correct", async function () {
                  expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.sub(20000).sub(fee1));

                  expect((await this.pool.getStake(this.alice.address, 0)).staked).to.equal(false);
                  expect((await this.pool.getStake(this.alice.address, 0)).endTime).to.equal(days.mul("15"));
                  expect((await this.pool.getStake(this.alice.address, 0)).totalYield).to.equal(reward.div("2"));
                  expect((await this.pool.getStake(this.alice.address, 0)).harvestedYield).to.equal("0");
                  expect((await this.pool.getStake(this.alice.address, 0)).lastHarvestTime).to.equal(
                    (await this.pool.getStake(this.alice.address, 0)).startTime
                  );
                  expect((await this.pool.getStake(this.alice.address, 0)).harvestableYield).to.equal(reward.div("2"));
                });

                it("can't second time unstake position", async function () {
                  await expect(this.pool.unstake(0)).to.be.revertedWith("Unstaked already");
                });

                describe("harvesting on first stake", function () {
                  beforeEach(async function () {
                    expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.sub(20000).sub(fee1));
                    harvest1 = await this.pool.harvest(0);
                  });

                  it("emits event Transfer with harvesting rewards", async function () {
                    await expect(harvest1).to.emit(this.token, "Transfer").withArgs(ZERO_ADDRESS, this.alice.address, reward.div(2));
                  });

                  it("emits event Harvest", async function () {
                    const stakeId = 0;
                    const harvestableYield = 77;
                    const currentTime = 15 * 24 * 60 * 60;

                    await expect(harvest1).to.emit(this.pool, "Harvest").withArgs(this.alice.address, stakeId, harvestableYield, currentTime);
                  });

                  it("Alice's stake became inactive and fee got burned", async function () {
                    expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.sub(20000).sub(fee1).add(reward.div(2)));

                    expect((await this.pool.getStake(this.alice.address, 0)).harvestableYield).to.equal(0);
                    expect((await this.pool.getStake(this.alice.address, 0)).harvestedYield).to.equal(reward.div("2"));
                    expect((await this.pool.getStake(this.alice.address, 0)).lastHarvestTime).to.equal(days.mul("15"));
                    expect(await this.token.balanceOf(this.pool.address)).to.equal(BigNumber.from(20000));
                  });

                  it("second harvest does not issue extra tokens", async function () {
                    await expect(this.pool.harvest(0)).to.be.revertedWith("harvestableYield is zero");
                  });
                });

                describe("early unstake second deposit after first", function () {
                  beforeEach(async function () {
                    unstake2 = await this.pool.unstake(1);
                  });

                  it("emits Transfer event on unstaking", async function () {
                    await expect(unstake2)
                      .to.emit(this.token, "Transfer")
                      .withArgs(this.pool.address, this.alice.address, BigNumber.from(20000).sub(fee2));
                  });

                  it("emits event Unstake on unstaking", async function () {
                    const stakeId = 1;
                    const depositAmount = 20000;
                    const startTime = 0;
                    const endTime = 30 * 24 * 60 * 60;
                    const earlyStake = true;

                    await expect(unstake2)
                      .to.emit(this.pool, "Unstake")
                      .withArgs(this.alice.address, stakeId, depositAmount, startTime, endTime, earlyStake);
                  });

                  it("contract states", async function () {
                    expect(await this.pool.stakedTokens()).to.equal("0");
                    expect(await this.pool.getStakesLength(this.alice.address)).to.equal("2");
                    expect(await this.token.balanceOf(this.pool.address)).to.equal(0);
                  });

                  it("her stake is correct", async function () {
                    expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.sub(fee1).sub(fee2));

                    expect((await this.pool.getStake(this.alice.address, 1)).staked).to.equal(false);
                    expect((await this.pool.getStake(this.alice.address, 1)).endTime).to.equal(days.mul("15"));
                    expect((await this.pool.getStake(this.alice.address, 1)).totalYield).to.equal(secondReward.div("2"));
                    expect((await this.pool.getStake(this.alice.address, 1)).harvestedYield).to.equal("0");
                    expect((await this.pool.getStake(this.alice.address, 1)).lastHarvestTime).to.equal(
                      (await this.pool.getStake(this.alice.address, 1)).startTime
                    );
                    expect((await this.pool.getStake(this.alice.address, 1)).harvestableYield).to.equal(secondReward.div("2"));
                  });

                  it("can't second time unstake position", async function () {
                    await expect(this.pool.unstake(1)).to.be.revertedWith("Unstaked already");
                  });

                  describe("harvesting on second stake", function () {
                    beforeEach(async function () {
                      expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.sub(fee1).sub(fee2));
                      harvest2 = await this.pool.harvest(1);
                    });

                    it("emits Transfer event with harvesting", async function () {
                      await expect(harvest2).to.emit(this.token, "Transfer").withArgs(ZERO_ADDRESS, this.alice.address, secondReward.div(2));
                    });

                    it("emits event Harvest with harvesting rewards", async function () {
                      const stakeId = 1;
                      const harvestableYield = 155;
                      const currentTime = 15 * 24 * 60 * 60;

                      await expect(harvest2).to.emit(this.pool, "Harvest").withArgs(this.alice.address, stakeId, harvestableYield, currentTime);
                    });

                    it("her stake is correct", async function () {
                      expect(await this.token.balanceOf(this.alice.address)).to.equal(
                        aliceInitBalance.sub(fee1).sub(fee2).add(secondReward.div("2"))
                      );
                      expect((await this.pool.getStake(this.alice.address, 1)).harvestableYield).to.equal(0);
                      expect((await this.pool.getStake(this.alice.address, 1)).harvestedYield).to.equal(secondReward.div("2"));
                      expect((await this.pool.getStake(this.alice.address, 1)).lastHarvestTime).to.equal(days.mul("15"));
                    });

                    it("second harvest does not issue extra tokens", async function () {
                      await expect(this.pool.harvest(1)).to.be.revertedWith("harvestableYield is zero");
                    });
                  });
                });
              });

              describe("+ 15 days (entire interval) passed", function () {
                beforeEach(async function () {
                  await this.pool.increaseCurrentTime(days.mul("15"));
                });

                it("her stake is correct", async function () {
                  expect((await this.pool.getStake(this.alice.address, 0)).staked).to.equal(true);
                  expect((await this.pool.getStake(this.alice.address, 0)).stakedAmount).to.equal("10000");
                  expect((await this.pool.getStake(this.alice.address, 0)).startTime).to.equal("0");
                  expect((await this.pool.getStake(this.alice.address, 0)).endTime).to.equal(days.mul("30"));
                  expect((await this.pool.getStake(this.alice.address, 0)).totalYield).to.equal(reward);
                  expect((await this.pool.getStake(this.alice.address, 0)).harvestedYield).to.equal("0");
                  expect((await this.pool.getStake(this.alice.address, 0)).lastHarvestTime).to.equal(
                    (await this.pool.getStake(this.alice.address, 0)).startTime
                  );
                  expect((await this.pool.getStake(this.alice.address, 0)).harvestableYield).to.equal(reward);

                  expect((await this.pool.getStake(this.alice.address, 1)).staked).to.equal(true);
                  expect((await this.pool.getStake(this.alice.address, 1)).stakedAmount).to.equal("20000");
                  expect((await this.pool.getStake(this.alice.address, 1)).startTime).to.equal("0");
                  expect((await this.pool.getStake(this.alice.address, 1)).endTime).to.equal(days.mul("30"));
                  expect((await this.pool.getStake(this.alice.address, 1)).totalYield).to.equal(secondReward);
                  expect((await this.pool.getStake(this.alice.address, 1)).harvestedYield).to.equal("0");
                  expect((await this.pool.getStake(this.alice.address, 1)).lastHarvestTime).to.equal(
                    (await this.pool.getStake(this.alice.address, 1)).startTime
                  );
                  expect((await this.pool.getStake(this.alice.address, 1)).harvestableYield).to.equal(secondReward);
                });

                describe("early unstake first deposit", function () {
                  beforeEach(async function () {
                    unstake1 = await this.pool.unstake(0);
                  });

                  it("emits Transfer event on unstaking", async function () {
                    await expect(unstake1)
                      .to.emit(this.token, "Transfer")
                      .withArgs(this.pool.address, this.alice.address, BigNumber.from(10000).sub(fee1));
                  });

                  it("emits event Unstake on unstaking", async function () {
                    const stakeId = 0;
                    const depositAmount = 10000;
                    const startTime = 0;
                    const endTime = 30 * 24 * 60 * 60;
                    const earlyStake = true;

                    await expect(unstake1)
                      .to.emit(this.pool, "Unstake")
                      .withArgs(this.alice.address, stakeId, depositAmount, startTime, endTime, earlyStake);
                  });

                  it("contract states", async function () {
                    expect(await this.pool.stakedTokens()).to.equal("20000");
                    expect(await this.pool.getStakesLength(this.alice.address)).to.equal("2");
                  });

                  it("her stake is correct", async function () {
                    expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.sub(20000).sub(fee1));
                    expect((await this.pool.getStake(this.alice.address, 0)).staked).to.equal(false);
                    expect((await this.pool.getStake(this.alice.address, 0)).endTime).to.equal(days.mul("30"));
                    expect((await this.pool.getStake(this.alice.address, 0)).totalYield).to.equal(reward);
                    expect((await this.pool.getStake(this.alice.address, 0)).harvestedYield).to.equal("0");
                    expect((await this.pool.getStake(this.alice.address, 0)).lastHarvestTime).to.equal(
                      (await this.pool.getStake(this.alice.address, 0)).startTime
                    );
                    expect((await this.pool.getStake(this.alice.address, 0)).harvestableYield).to.equal(reward);
                  });

                  it("can't second time unstake position", async function () {
                    await expect(this.pool.unstake(0)).to.be.revertedWith("Unstaked already");
                  });

                  describe("Alice harvests her first stake", function () {
                    beforeEach(async function () {
                      harvest1 = await this.pool.harvest(0);
                    });

                    it("emits event Transfer on harvest", async function () {
                      await expect(harvest1).to.emit(this.token, "Transfer").withArgs(ZERO_ADDRESS, this.alice.address, reward);
                    });

                    it("emits event Harvest with harvesting rewards", async function () {
                      const stakeId = 0;
                      const harvestableYield = 155;
                      const currentTime = 30 * 24 * 60 * 60;

                      await expect(harvest1).to.emit(this.pool, "Harvest").withArgs(this.alice.address, stakeId, harvestableYield, currentTime);
                    });

                    it("check resulting balance", async function () {
                      expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.sub(20000));

                      expect((await this.pool.getStake(this.alice.address, 0)).harvestableYield).to.equal(0);
                      expect((await this.pool.getStake(this.alice.address, 0)).harvestedYield).to.equal(reward);
                      expect((await this.pool.getStake(this.alice.address, 0)).lastHarvestTime).to.equal(days.mul("30"));
                    });

                    it("unable to harvest already harvested stake again", async function () {
                      await expect(this.pool.harvest(0)).to.be.revertedWith("harvestableYield is zero");
                    });
                  });

                  describe("Alice early unstakes second deposit", function () {
                    beforeEach(async function () {
                      unstake2 = await this.pool.unstake(1);
                    });

                    it("emits event Transfer on unstaking", async function () {
                      await expect(unstake2)
                        .to.emit(this.token, "Transfer")
                        .withArgs(this.pool.address, this.alice.address, BigNumber.from(20000).sub(fee2));
                    });

                    it("emits event Unstake on unstaking", async function () {
                      const stakeId = 1;
                      const depositAmount = 20000;
                      const startTime = 0;
                      const endTime = 30 * 24 * 60 * 60;
                      const earlyStake = true;

                      await expect(unstake2)
                        .to.emit(this.pool, "Unstake")
                        .withArgs(this.alice.address, stakeId, depositAmount, startTime, endTime, earlyStake);
                    });

                    it("contract states", async function () {
                      expect(await this.pool.stakedTokens()).to.equal("0");
                      expect(await this.pool.getStakesLength(this.alice.address)).to.equal("2");
                    });

                    it("check resulting Alice's balance and stake status", async function () {
                      expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.sub(fee1).sub(fee2));

                      expect((await this.pool.getStake(this.alice.address, 1)).staked).to.equal(false);
                      expect((await this.pool.getStake(this.alice.address, 1)).endTime).to.equal(days.mul("30"));
                      expect((await this.pool.getStake(this.alice.address, 1)).totalYield).to.equal(secondReward);
                      expect((await this.pool.getStake(this.alice.address, 1)).harvestedYield).to.equal("0");
                      expect((await this.pool.getStake(this.alice.address, 1)).lastHarvestTime).to.equal(
                        (await this.pool.getStake(this.alice.address, 1)).startTime
                      );
                      expect((await this.pool.getStake(this.alice.address, 1)).harvestableYield).to.equal(secondReward);
                    });

                    it("can't second time unstake position", async function () {
                      await expect(this.pool.unstake(1)).to.be.revertedWith("Unstaked already");
                    });

                    describe("Alice harvests second stake", function () {
                      beforeEach(async function () {
                        expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.sub(fee1).sub(fee2));
                        harvest2 = await this.pool.harvest(1);
                      });

                      it("Staking contract token balance decreased", async function () {
                        expect(await this.token.balanceOf(this.pool.address)).to.equal(0);
                      });

                      it("emits event Transfer on harvest", async function () {
                        await expect(harvest2).to.emit(this.token, "Transfer").withArgs(ZERO_ADDRESS, this.alice.address, secondReward);
                      });
                      it("emits event Harvest with harvesting rewards", async function () {
                        const stakeId = 1;
                        const harvestableYield = 310;
                        const currentTime = 30 * 24 * 60 * 60;

                        await expect(harvest2)
                          .to.emit(this.pool, "Harvest")
                          .withArgs(this.alice.address, stakeId, harvestableYield, currentTime);
                      });

                      it("check token balance and stake status", async function () {
                        expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.sub(fee1));
                        expect((await this.pool.getStake(this.alice.address, 1)).harvestableYield).to.equal(0);
                        expect((await this.pool.getStake(this.alice.address, 1)).harvestedYield).to.equal(secondReward);
                        expect((await this.pool.getStake(this.alice.address, 1)).lastHarvestTime).to.equal(days.mul("30"));
                      });

                      it("second harvest does not issue extra tokens", async function () {
                        await expect(this.pool.harvest(1)).to.be.revertedWith("harvestableYield is zero");
                      });
                    });
                  });
                });
                describe("+ 1 day passed (all expired))", function () {
                  beforeEach(async function () {
                    await this.pool.increaseCurrentTime(days.mul("1"));
                  });

                  it("her stake is correct", async function () {
                    expect((await this.pool.getStake(this.alice.address, 0)).staked).to.equal(true);
                    expect((await this.pool.getStake(this.alice.address, 0)).stakedAmount).to.equal("10000");
                    expect((await this.pool.getStake(this.alice.address, 0)).startTime).to.equal("0");
                    expect((await this.pool.getStake(this.alice.address, 0)).endTime).to.equal(days.mul("30"));
                    expect((await this.pool.getStake(this.alice.address, 0)).totalYield).to.equal(reward);
                    expect((await this.pool.getStake(this.alice.address, 0)).harvestedYield).to.equal("0");
                    expect((await this.pool.getStake(this.alice.address, 0)).lastHarvestTime).to.equal(
                      (await this.pool.getStake(this.alice.address, 0)).startTime
                    );
                    expect((await this.pool.getStake(this.alice.address, 0)).harvestableYield).to.equal(reward);

                    expect((await this.pool.getStake(this.alice.address, 1)).staked).to.equal(true);
                    expect((await this.pool.getStake(this.alice.address, 1)).stakedAmount).to.equal("20000");
                    expect((await this.pool.getStake(this.alice.address, 1)).startTime).to.equal("0");
                    expect((await this.pool.getStake(this.alice.address, 1)).endTime).to.equal(days.mul("30"));
                    expect((await this.pool.getStake(this.alice.address, 1)).totalYield).to.equal(secondReward);
                    expect((await this.pool.getStake(this.alice.address, 1)).harvestedYield).to.equal("0");
                    expect((await this.pool.getStake(this.alice.address, 1)).lastHarvestTime).to.equal(
                      (await this.pool.getStake(this.alice.address, 1)).startTime
                    );
                    expect((await this.pool.getStake(this.alice.address, 1)).harvestableYield).to.equal(secondReward);
                  });

                  describe("unstake first deposit", function () {
                    beforeEach(async function () {
                      await this.pool.setMrunPerSkin(1000);
                      unstake1 = await this.pool.unstake(0);
                    });

                    it("emits event Transfer on unstaking", async function () {
                      await expect(unstake1)
                        .to.emit(this.token, "Transfer")
                        .withArgs(this.pool.address, this.alice.address, BigNumber.from(10000));
                    });

                    it("emits event Unstake on unstaking", async function () {
                      const stakeId = 0;
                      const depositAmount = 10000;
                      const startTime = 0;
                      const endTime = 30 * 24 * 60 * 60;
                      const earlyStake = false;

                      await expect(unstake1)
                        .to.emit(this.pool, "Unstake")
                        .withArgs(this.alice.address, stakeId, depositAmount, startTime, endTime, earlyStake);
                    });

                    it("emits event NFT Transfer on unstaking", async function () {
                      await expect(unstake1).to.emit(this.nftCollection, "TransferBatch");
                    });

                    it("check the increase supply of skins by the amount of the reward", async function () {
                      rewardSkins = (await this.pool.getStake(this.alice.address, 0)).skinsAmount;
                      expect(await this.nftCollection.getKindSupply("0x0300")).to.equal(rewardSkins);
                    });

                    it("contract states", async function () {
                      expect(await this.pool.stakedTokens()).to.equal("20000");
                      expect(await this.pool.getStakesLength(this.alice.address)).to.equal("2");

                      expect(await this.token.balanceOf(this.pool.address)).to.equal(BigNumber.from(20000));
                    });

                    it("her stake is correct", async function () {
                      expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.sub(20000));
                      expect((await this.pool.getStake(this.alice.address, 0)).staked).to.equal(false);
                      expect((await this.pool.getStake(this.alice.address, 0)).endTime).to.equal(days.mul("30"));
                      expect((await this.pool.getStake(this.alice.address, 0)).totalYield).to.equal(reward);
                      expect((await this.pool.getStake(this.alice.address, 0)).harvestedYield).to.equal("0");
                      expect((await this.pool.getStake(this.alice.address, 0)).lastHarvestTime).to.equal(
                        (await this.pool.getStake(this.alice.address, 0)).startTime
                      );
                      expect((await this.pool.getStake(this.alice.address, 0)).harvestableYield).to.equal(reward);
                    });

                    it("can't second time unstake position", async function () {
                      await expect(this.pool.unstake(0)).to.be.revertedWith("Unstaked already");
                    });

                    describe("harvesting on first stake", function () {
                      beforeEach(async function () {
                        harvest1 = await this.pool.harvest(0);
                      });

                      it("emits event Transfer on harvest", async function () {
                        await expect(harvest1).to.emit(this.token, "Transfer").withArgs(ZERO_ADDRESS, this.alice.address, reward);
                      });

                      it("emits event Harvest with harvesting rewards", async function () {
                        const stakeId = 0;
                        const harvestableYield = 155;
                        const currentTime = 31 * 24 * 60 * 60;

                        await expect(harvest1)
                          .to.emit(this.pool, "Harvest")
                          .withArgs(this.alice.address, stakeId, harvestableYield, currentTime);
                      });

                      it("her stake is correct", async function () {
                        expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.sub(20000).add(reward));
                        expect((await this.pool.getStake(this.alice.address, 0)).harvestableYield).to.equal(0);
                        expect((await this.pool.getStake(this.alice.address, 0)).harvestedYield).to.equal(reward);
                        expect((await this.pool.getStake(this.alice.address, 0)).lastHarvestTime).to.equal(days.mul("31"));
                      });

                      it("second harvest does not issue extra tokens", async function () {
                        await expect(this.pool.harvest(0)).to.be.revertedWith("harvestableYield is zero");
                      });
                    });

                    describe("unstake second deposit after first", function () {
                      beforeEach(async function () {
                        unstake2 = await this.pool.unstake(1);
                      });

                      it("emits event Transfer on unstaking", async function () {
                        await expect(unstake2)
                          .to.emit(this.token, "Transfer")
                          .withArgs(this.pool.address, this.alice.address, BigNumber.from(20000));
                      });

                      it("emits event Unstake on unstaking", async function () {
                        const stakeId = 1;
                        const depositAmount = 20000;
                        const startTime = 0;
                        const endTime = 30 * 24 * 60 * 60;
                        const earlyStake = false;

                        await expect(unstake2)
                          .to.emit(this.pool, "Unstake")
                          .withArgs(this.alice.address, stakeId, depositAmount, startTime, endTime, earlyStake);
                      });

                      it("contract states", async function () {
                        expect(await this.pool.stakedTokens()).to.equal("0");
                        expect(await this.pool.getStakesLength(this.alice.address)).to.equal("2");

                        expect(await this.token.balanceOf(this.pool.address)).to.equal(0);
                      });

                      it("her stake is correct", async function () {
                        expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance);
                        expect((await this.pool.getStake(this.alice.address, 1)).staked).to.equal(false);
                        expect((await this.pool.getStake(this.alice.address, 1)).endTime).to.equal(days.mul("30"));
                        expect((await this.pool.getStake(this.alice.address, 1)).totalYield).to.equal(secondReward);
                        expect((await this.pool.getStake(this.alice.address, 1)).harvestedYield).to.equal("0");
                        expect((await this.pool.getStake(this.alice.address, 1)).lastHarvestTime).to.equal(
                          (await this.pool.getStake(this.alice.address, 1)).startTime
                        );
                        expect((await this.pool.getStake(this.alice.address, 1)).harvestableYield).to.equal(secondReward);
                      });

                      it("can't second time unstake position", async function () {
                        await expect(this.pool.unstake(1)).to.be.revertedWith("Unstaked already");
                      });

                      describe("harvesting on first and second stake", function () {
                        beforeEach(async function () {
                          expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance);
                          expect(await this.token.balanceOf(this.pool.address)).to.equal(0);
                          harvest1 = await this.pool.harvest(0);
                          harvest2 = await this.pool.harvest(1);
                        });

                        it("Staking contract token balance decreased", async function () {
                          expect(await this.token.balanceOf(this.pool.address)).to.equal(0);
                        });

                        it("emits Transfers event on harvesting", async function () {
                          await expect(harvest1).to.emit(this.token, "Transfer").withArgs(ZERO_ADDRESS, this.alice.address, reward);
                          await expect(harvest2).to.emit(this.token, "Transfer").withArgs(ZERO_ADDRESS, this.alice.address, secondReward);
                        });

                        it("emits event Harvest with harvesting rewards", async function () {
                          const stakeId = 0;
                          const harvestableYield = 155;
                          const currentTime = 31 * 24 * 60 * 60;

                          await expect(harvest1)
                            .to.emit(this.pool, "Harvest")
                            .withArgs(this.alice.address, stakeId, harvestableYield, currentTime);
                        });

                        it("her stake is correct after both harvest", async function () {
                          expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.add(totalReward));
                          expect((await this.pool.getStake(this.alice.address, 1)).harvestableYield).to.equal(0);
                          expect((await this.pool.getStake(this.alice.address, 1)).harvestedYield).to.equal(secondReward);
                          expect((await this.pool.getStake(this.alice.address, 1)).lastHarvestTime).to.equal(days.mul("31"));

                          expect(await this.token.balanceOf(this.alice.address)).to.equal(aliceInitBalance.add(totalReward));
                          expect(await this.token.balanceOf(this.pool.address)).to.equal(0);
                        });

                        it("second harvest does not issue extra tokens", async function () {
                          await expect(this.pool.harvest(0)).to.be.revertedWith("harvestableYield is zero");
                        });

                        it("second harvest does not issue extra tokens", async function () {
                          await expect(this.pool.harvest(1)).to.be.revertedWith("harvestableYield is zero");
                        });
                      });
                    });
                  });
                });
              });
            });
            describe("then Bob deposited", function () {
              beforeEach(async function () {
                bobReward = BigNumber.from(345).mul(155).div(10000);
                // await this.token.transfer(this.pool.address, bobReward)

                await this.token.transfer(this.bob.address, BigNumber.from(345));
                await this.token.connect(this.bob).approve(this.pool.address, 345);
                stake1 = await this.pool.connect(this.bob).stake(345);
              });

              it("emits event Stake", async function () {
                const stakeId = 0;
                const depositAmount = 345;
                const startTime = 0;
                const endTime = 30 * 24 * 60 * 60;

                await expect(stake1).to.emit(this.pool, "Stake").withArgs(this.bob.address, stakeId, depositAmount, startTime, endTime);
              });

              it("check Bob's stake details", async function () {
                expect(await this.pool.getStakesLength(this.bob.address)).to.equal("1");
                expect((await this.pool.getStake(this.bob.address, 0)).staked).to.equal(true);
                expect((await this.pool.getStake(this.bob.address, 0)).stakedAmount).to.equal("345");
                expect((await this.pool.getStake(this.bob.address, 0)).harvestedYield).to.equal("0");
                expect((await this.pool.getStake(this.bob.address, 0)).totalYield).to.equal(BigNumber.from("345").mul("155").div("10000"));
              });

              describe("after 1 day passed Bob unstakes with fee charged", function () {
                beforeEach(async function () {
                  await this.pool.increaseCurrentTime(days.mul("1"));
                  bobUnstake1 = this.pool.connect(this.bob).unstake(0);
                });

                it("emits events Transfer and changes states", async function () {
                  feeBob = BigNumber.from(345).mul(155).div(10000);

                  await expect(bobUnstake1)
                    .to.emit(this.token, "Transfer")
                    .withArgs(this.pool.address, this.bob.address, BigNumber.from(345).sub(feeBob));

                  expect(await this.token.balanceOf(this.bob.address)).to.equal(BigNumber.from(345).sub(feeBob));
                });

                it("emits event Unstake", async function () {
                  const stakeId = 0;
                  const depositAmount = 345;
                  const startTime = 0;
                  const endTime = 30 * 24 * 60 * 60;
                  const earlyStake = true;

                  await expect(bobUnstake1)
                    .to.emit(this.pool, "Unstake")
                    .withArgs(this.bob.address, stakeId, depositAmount, startTime, endTime, earlyStake);
                });
              });

              describe("after 30 day passed Bob unstakes with fee charged", function () {
                beforeEach(async function () {
                  await this.pool.increaseCurrentTime(days.mul("30"));
                  bobUnstake30 = this.pool.connect(this.bob).unstake(0);
                });

                it("emits events Transfer and changes states", async function () {
                  await expect(bobUnstake30)
                    .to.emit(this.token, "Transfer")
                    .withArgs(this.pool.address, this.bob.address, BigNumber.from(345).sub(feeBob));

                  expect(await this.token.balanceOf(this.bob.address)).to.equal(BigNumber.from(345).sub(feeBob));
                });

                it("emits event Unstake", async function () {
                  const stakeId = 0;
                  const depositAmount = 345;
                  const startTime = 0;
                  const endTime = 30 * 24 * 60 * 60;
                  const earlyStake = true;

                  await expect(bobUnstake30)
                    .to.emit(this.pool, "Unstake")
                    .withArgs(this.bob.address, stakeId, depositAmount, startTime, endTime, earlyStake);
                });
              });

              describe("after 30 day passed Bob unstakes without fee charged", function () {
                beforeEach(async function () {
                  await this.pool.increaseCurrentTime(days.mul("31"));
                  bobUnstake31 = this.pool.connect(this.bob).unstake(0);
                });

                it("emits events Transfer and changes states", async function () {
                  await expect(bobUnstake31).to.emit(this.token, "Transfer").withArgs(this.pool.address, this.bob.address, BigNumber.from(345));

                  expect(await this.token.balanceOf(this.bob.address)).to.equal(BigNumber.from(345));
                });

                it("emits event Unstake", async function () {
                  const stakeId = 0;
                  const depositAmount = 345;
                  const startTime = 0;
                  const endTime = 30 * 24 * 60 * 60;
                  const earlyStake = false;

                  await expect(bobUnstake31)
                    .to.emit(this.pool, "Unstake")
                    .withArgs(this.bob.address, stakeId, depositAmount, startTime, endTime, earlyStake);
                });
              });

              it("Non-owner can't stop staking", async function () {
                await expect(this.pool.connect(this.bob).stop()).to.be.revertedWith("Ownable: caller is not the owner");
              });
            });
          });
        });
      });
    });

    describe("90 days, 11.05% interest, 11.05% penalty", function () {
      beforeEach(async function () {
        this.token = await this.tokenFactory.deploy();
        await this.token.deployed();
        this.pool = await this.contract.deploy(this.token.address, stakeDuration90Days, 1105, 1105, this.nftCollection.address);
        await this.pool.deployed();
        await this.pool.setCurrentTime(1700000000);
      });

      it("initial states", async function () {
        const deployed = await this.pool.deployed();
        expect(deployed, true);
        expect(await this.pool.owner()).to.equal(this.alice.address);
        expect(await this.pool.stakesOpen()).to.equal(false);
        expect(await this.pool.stakeDuration()).to.equal(stakeDuration90Days);
        expect(await this.pool.yieldRate()).to.equal("1105");
        expect(await this.pool.earlyUnstakeFee()).to.equal("1105");
        expect(await this.pool.stakedTokens()).to.equal("0");
        expect(await this.pool.getStakesLength(this.alice.address)).to.equal("0");
      });
    });
  });
});
