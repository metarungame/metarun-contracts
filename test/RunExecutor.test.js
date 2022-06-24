const { expect } = require("chai");
const { ethers } = require("hardhat");
URI_TOKEN = "localhost:8000/{id}.json";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("RunExecutor", function () {
  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.runExecutorFactory = await ethers.getContractFactory("RunExecutor");
    this.signers = await ethers.getSigners();
    this.winner = this.signers[1].address;
    this.loser = this.signers[2].address;
  });

  beforeEach(async function () {
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
    this.runExecutor = await upgrades.deployProxy(this.runExecutorFactory, [this.metarunCollection.address]);

    const MINTER_ROLE = await this.metarunCollection.MINTER_ROLE();
    const SETTER_ROLE = await this.metarunCollection.SETTER_ROLE();
    this.metarunCollection.grantRole(MINTER_ROLE, this.runExecutor.address);
    this.metarunCollection.grantRole(SETTER_ROLE, this.runExecutor.address);

    this.winnerCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 1;
    this.loserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
    this.badWinnerCharacterTokenId = ((await this.metarunCollection.RARE_SKIN_KIND()) << 16) + 1;
    this.badLoserCharacterTokenId = ((await this.metarunCollection.RARE_SKIN_KIND()) << 16) + 3;
  });

  it("should perform a run successfully", async function () {
    await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
    const expectedWinnerBalance = 100;
    const expectedLoserBalance = 10;
    this.runExecutor.executeRun(
      this.winner,
      expectedWinnerBalance,
      this.winnerCharacterTokenId,
      this.loser,
      expectedLoserBalance,
      this.loserCharacterTokenId
    );
    const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
    const actualWinnerBalance = await this.metarunCollection.balanceOf(this.winner, opalId);
    const actualLoserBalance = await this.metarunCollection.balanceOf(this.loser, opalId);
    expect(actualWinnerBalance).to.be.eq(expectedWinnerBalance);
    expect(actualLoserBalance).to.be.eq(expectedLoserBalance);
  });

  it("should perform a run with a losing bot successfully", async function () {
    await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
    const expectedWinnerBalance = 100;
    this.runExecutor.executeRun(this.winner, expectedWinnerBalance, this.winnerCharacterTokenId, ZERO_ADDRESS, 0, 0);
    const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
    const actualWinnerBalance = await this.metarunCollection.balanceOf(this.winner, opalId);
    expect(actualWinnerBalance).to.be.eq(expectedWinnerBalance);
  });

  it("should perform a run with a winning bot successfully", async function () {
    await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
    const expectedLoserBalance = 10;
    this.runExecutor.executeRun(ZERO_ADDRESS, 0, 0, this.loser, expectedLoserBalance, this.loserCharacterTokenId);
    const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
    const actualLoserBalance = await this.metarunCollection.balanceOf(this.loser, opalId);
    expect(actualLoserBalance).to.be.eq(expectedLoserBalance);
  });

  it("should revert for non-deployer", async function () {
    await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
    const attempt = this.runExecutor
      .connect(this.signers[1])
      .executeRun(this.winner, 100, this.winnerCharacterTokenId, this.loser, 20, this.loserCharacterTokenId);
    await expect(attempt).to.be.revertedWith("RunExecutor: tx sender should have EXECUTOR_ROLE");
  });

  it("should revert for bad winner token id", async function () {
    await this.metarunCollection.mint(this.winner, this.badWinnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
    const attempt = this.runExecutor.executeRun(this.winner, 100, this.badWinnerCharacterTokenId, this.loser, 20, this.loserCharacterTokenId);
    await expect(attempt).to.be.revertedWith("RunExecutor: winner's token id should be character or ticket");
  });

  it("should revert for bad loser token id", async function () {
    await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.loser, this.badLoserCharacterTokenId, 1);
    const attempt = this.runExecutor.executeRun(this.winner, 100, this.winnerCharacterTokenId, this.loser, 20, this.badLoserCharacterTokenId);
    await expect(attempt).to.be.revertedWith("RunExecutor: loser's token id should be character or ticket");
  });

  it("should revert for bad winner opal amount", async function () {
    await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
    const attempt = this.runExecutor.executeRun(this.winner, 0, this.winnerCharacterTokenId, this.loser, 20, this.loserCharacterTokenId);
    await expect(attempt).to.be.revertedWith("RunExecutor: winner's opal to be minted should be defined");
  });

  it("should revert if winner doesn't have a winner character", async function () {
    await this.metarunCollection.mint(this.loser, this.winnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.winner, this.loserCharacterTokenId, 1);
    const expectedWinnerBalance = 100;
    const expectedLoserBalance = 10;
    const attempt = this.runExecutor.executeRun(
      this.winner,
      expectedWinnerBalance,
      this.winnerCharacterTokenId,
      this.loser,
      expectedLoserBalance,
      this.loserCharacterTokenId
    );
    await expect(attempt).to.be.revertedWith("RunExecutor: winner should own winner character");
  });

  it("should revert if loser doesn't have a loser character", async function () {
    const dummyLoserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 100;
    await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1); // dummy value on mint
    const expectedWinnerBalance = 100;
    const expectedLoserBalance = 10;
    const attempt = this.runExecutor.executeRun(
      this.winner,
      expectedWinnerBalance,
      this.winnerCharacterTokenId,
      this.loser,
      expectedLoserBalance,
      dummyLoserCharacterTokenId
    );
    await expect(attempt).to.be.revertedWith("RunExecutor: loser should own loser character");
  });
});
