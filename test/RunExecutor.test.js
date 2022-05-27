const { expect } = require("chai");
const { ethers } = require("hardhat");
URI_TOKEN = "localhost:8000/{id}.json";

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
  });

  it("should perform a run successfully", async function () {
    const winnerCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 1;
    const loserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
    await this.metarunCollection.mint(this.winner, winnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.loser, loserCharacterTokenId, 1);
    const expectedWinnerBalance = 100;
    const expectedLoserBalance = 10;
    this.runExecutor.executeRun(this.winner, expectedWinnerBalance, this.loser, expectedLoserBalance);
    const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
    const actualWinnerBalance = await this.metarunCollection.balanceOf(this.winner, opalId);
    const actualLoserBalance = await this.metarunCollection.balanceOf(this.loser, opalId);
    expect(actualWinnerBalance).to.be.eq(expectedWinnerBalance);
    expect(actualLoserBalance).to.be.eq(expectedLoserBalance);
  });

  it("should revert for non-deployer", async function () {
    await this.metarunCollection.mint(this.winner, 1, 1);
    await this.metarunCollection.mint(this.loser, 2, 1);
    const attempt = this.runExecutor.connect(this.signers[1]).executeRun(this.winner, 100, this.loser, 20);
    await expect(attempt).to.be.revertedWith("RunExecutor: tx sender should have EXECUTOR_ROLE");
  });

  it("should revert for bad winner token id", async function () {
    this.skip();
    const badWinnerCharacterTokenId = ((await this.metarunCollection.RARE_SKIN_KIND()) << 16) + 1;
    const loserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
    await this.metarunCollection.mint(this.winner, badWinnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.loser, loserCharacterTokenId, 1);
    const attempt = this.runExecutor.executeRun(this.winner, 100, this.loser, 20);
    await expect(attempt).to.be.revertedWith("RunExecutor: winner's character token id should be valid");
  });

  it("should revert for bad loser token id", async function () {
    this.skip();
    const winnerCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 1;
    const badLoserCharacterTokenId = ((await this.metarunCollection.RARE_SKIN_KIND()) << 16) + 3;
    await this.metarunCollection.mint(this.winner, winnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.loser, badLoserCharacterTokenId, 1);
    const attempt = this.runExecutor.executeRun(this.winner, 100, this.loser, 20);
    await expect(attempt).to.be.revertedWith("RunExecutor: loser's character token id should be valid");
  });

  it("should revert for bad winner opal amount", async function () {
    const winnerCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 1;
    const loserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
    await this.metarunCollection.mint(this.winner, winnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.loser, loserCharacterTokenId, 1);
    const attempt = this.runExecutor.executeRun(this.winner, 0, this.loser, 20);
    await expect(attempt).to.be.revertedWith("RunExecutor: winner's opal to be minted should be defined");
  });

  it("should revert if winner doesn't have a winner character", async function () {
    this.skip();
    const winnerCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 1;
    const loserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
    await this.metarunCollection.mint(this.winner, loserCharacterTokenId, 1);
    await this.metarunCollection.mint(this.loser, winnerCharacterTokenId, 1);
    const expectedWinnerBalance = 100;
    const expectedLoserBalance = 10;
    const attempt = this.runExecutor.executeRun(this.winner, expectedWinnerBalance, this.loser, expectedLoserBalance);
    await expect(attempt).to.be.revertedWith("RunExecutor: winner should own winner character");
  });

  it("should revert if loser doesn't have a loser character", async function () {
    this.skip();
    const winnerCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 1;
    const loserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
    const dummyLoserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 100;
    await this.metarunCollection.mint(this.winner, winnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.loser, loserCharacterTokenId, 1); // dummy value on mint
    const expectedWinnerBalance = 100;
    const expectedLoserBalance = 10;
    const attempt = this.runExecutor.executeRun(this.winner, expectedWinnerBalance, this.loser, expectedLoserBalance);
    await expect(attempt).to.be.revertedWith("RunExecutor: loser should own loser character");
  });
});
