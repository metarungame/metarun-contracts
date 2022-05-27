const { expect } = require("chai");
const { ethers } = require("hardhat");
URI_TOKEN = "localhost:8000/{id}.json";

describe("RunExecutor", function () {
  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.runExecutorFactory = await ethers.getContractFactory("RunExecutor");
    this.signers = await ethers.getSigners();
    this.winner = this.signers[1].address;
    this.looser = this.signers[2].address;
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
    const looserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
    await this.metarunCollection.mint(this.winner, winnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.looser, looserCharacterTokenId, 1);
    const expectedWinnerBalance = 100;
    const expectedLooserBalance = 10;
    this.runExecutor.executeRun(this.winner, expectedWinnerBalance, this.looser, expectedLooserBalance);
    const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
    const actualWinnerBalance = await this.metarunCollection.balanceOf(this.winner, opalId);
    const actualLooserBalance = await this.metarunCollection.balanceOf(this.looser, opalId);
    expect(actualWinnerBalance).to.be.eq(expectedWinnerBalance);
    expect(actualLooserBalance).to.be.eq(expectedLooserBalance);
  });

  it("should revert for non-deployer", async function () {
    await this.metarunCollection.mint(this.winner, 1, 1);
    await this.metarunCollection.mint(this.looser, 2, 1);
    const attempt = this.runExecutor.connect(this.signers[1]).executeRun(this.winner, 100, this.looser, 20);
    await expect(attempt).to.be.revertedWith("RunExecutor: tx sender should have EXECUTOR_ROLE");
  });

  it("should revert for bad winner token id", async function () {
    this.skip();
    const badWinnerCharacterTokenId = ((await this.metarunCollection.RARE_SKIN_KIND()) << 16) + 1;
    const looserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
    await this.metarunCollection.mint(this.winner, badWinnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.looser, looserCharacterTokenId, 1);
    const attempt = this.runExecutor.executeRun(this.winner, 100, this.looser, 20);
    await expect(attempt).to.be.revertedWith("RunExecutor: winner's character token id should be valid");
  });

  it("should revert for bad looser token id", async function () {
    this.skip();
    const winnerCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 1;
    const badLooserCharacterTokenId = ((await this.metarunCollection.RARE_SKIN_KIND()) << 16) + 3;
    await this.metarunCollection.mint(this.winner, winnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.looser, badLooserCharacterTokenId, 1);
    const attempt = this.runExecutor.executeRun(this.winner, 100, this.looser, 20);
    await expect(attempt).to.be.revertedWith("RunExecutor: looser's character token id should be valid");
  });

  it("should revert for bad winner opal amount", async function () {
    const winnerCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 1;
    const looserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
    await this.metarunCollection.mint(this.winner, winnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.looser, looserCharacterTokenId, 1);
    const attempt = this.runExecutor.executeRun(this.winner, 0, this.looser, 20);
    await expect(attempt).to.be.revertedWith("RunExecutor: winner's opal to be minted should be defined");
  });

  it("should revert if winner doesn't have a winner character", async function () {
    this.skip();
    const winnerCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 1;
    const looserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
    await this.metarunCollection.mint(this.winner, looserCharacterTokenId, 1);
    await this.metarunCollection.mint(this.looser, winnerCharacterTokenId, 1);
    const expectedWinnerBalance = 100;
    const expectedLooserBalance = 10;
    const attempt = this.runExecutor.executeRun(this.winner, expectedWinnerBalance, this.looser, expectedLooserBalance);
    await expect(attempt).to.be.revertedWith("RunExecutor: winner should own winner character");
  });

  it("should revert if looser doesn't have a looser character", async function () {
    this.skip();
    const winnerCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 1;
    const looserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
    const dummyLooserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 100;
    await this.metarunCollection.mint(this.winner, winnerCharacterTokenId, 1);
    await this.metarunCollection.mint(this.looser, looserCharacterTokenId, 1); // dummy value on mint
    const expectedWinnerBalance = 100;
    const expectedLooserBalance = 10;
    const attempt = this.runExecutor.executeRun(this.winner, expectedWinnerBalance, this.looser, expectedLooserBalance);
    await expect(attempt).to.be.revertedWith("RunExecutor: looser should own looser character");
  });
});
