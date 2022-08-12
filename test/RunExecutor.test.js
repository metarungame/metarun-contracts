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
    // here and further: second means second user in run (in between winner and looser)
    this.second = this.signers[2].address;
    this.loser = this.signers[3].address;
  });

  beforeEach(async function () {
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
    this.runExecutor = await upgrades.deployProxy(this.runExecutorFactory, [this.metarunCollection.address]);

    const MINTER_ROLE = await this.metarunCollection.MINTER_ROLE();
    const SETTER_ROLE = await this.metarunCollection.SETTER_ROLE();
    this.metarunCollection.grantRole(MINTER_ROLE, this.runExecutor.address);
    this.metarunCollection.grantRole(SETTER_ROLE, this.runExecutor.address);

    this.winnerCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 1;
    this.secondCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 2;
    this.loserCharacterTokenId = ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
    this.badWinnerCharacterTokenId = ((await this.metarunCollection.RARE_SKIN_KIND()) << 16) + 1;
    this.badSecondCharacterTokenId = ((await this.metarunCollection.RARE_SKIN_KIND()) << 16) + 1;
    this.badLoserCharacterTokenId = ((await this.metarunCollection.RARE_SKIN_KIND()) << 16) + 3;
  });

  describe("Run with two participants", function () {
    it("should perform a run successfully", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      const expectedWinnerBalance = 100;
      const expectedLoserBalance = 10;
      await this.runExecutor.executeRun(
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
      await expect(attempt).to.be.revertedWith("RunExecutor: participant's token id should be game token");
    });

    it("should revert for bad loser token id", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.badLoserCharacterTokenId, 1);
      const attempt = this.runExecutor.executeRun(this.winner, 100, this.winnerCharacterTokenId, this.loser, 20, this.badLoserCharacterTokenId);
      await expect(attempt).to.be.revertedWith("RunExecutor: participant's token id should be game token");
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
      await expect(attempt).to.be.revertedWith("RunExecutor: participant should own its character");
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
      await expect(attempt).to.be.revertedWith("RunExecutor: participant should own its character");
    });
  });

  describe("Run with three participants", function () {
    it("should perform a run successfully", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      const expectedWinnerBalance = 100;
      const expectedSecondBalance = 50;
      const expectedLoserBalance = 10;
      await this.runExecutor.executeThreeParticipantsRun(
        this.winner,
        expectedWinnerBalance,
        this.winnerCharacterTokenId,
        this.second,
        expectedSecondBalance,
        this.secondCharacterTokenId,
        this.loser,
        expectedLoserBalance,
        this.loserCharacterTokenId
      );
      const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
      const actualWinnerBalance = await this.metarunCollection.balanceOf(this.winner, opalId);
      const actualSecondBalance = await this.metarunCollection.balanceOf(this.second, opalId);
      const actualLoserBalance = await this.metarunCollection.balanceOf(this.loser, opalId);
      expect(actualWinnerBalance).to.be.eq(expectedWinnerBalance);
      expect(actualSecondBalance).to.be.eq(expectedSecondBalance);
      expect(actualLoserBalance).to.be.eq(expectedLoserBalance);
    });

    it("should perform a run with a losing bot successfully", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      const expectedWinnerBalance = 100;
      const expectedSecondBalance = 50;
      this.runExecutor.executeThreeParticipantsRun(
        this.winner,
        expectedWinnerBalance,
        this.winnerCharacterTokenId,
        this.second,
        expectedSecondBalance,
        this.secondCharacterTokenId,
        ZERO_ADDRESS,
        0,
        0
      );
      const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
      const actualWinnerBalance = await this.metarunCollection.balanceOf(this.winner, opalId);
      const actualSecondBalance = await this.metarunCollection.balanceOf(this.second, opalId);
      expect(actualWinnerBalance).to.be.eq(expectedWinnerBalance);
      expect(actualSecondBalance).to.be.eq(actualSecondBalance);
    });

    it("should perform a run with a winning bot successfully", async function () {
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      const expectedLoserBalance = 10;
      const expectedSecondBalance = 50;
      this.runExecutor.executeThreeParticipantsRun(
        ZERO_ADDRESS,
        0,
        0,
        this.second,
        expectedSecondBalance,
        this.secondCharacterTokenId,
        this.loser,
        expectedLoserBalance,
        this.loserCharacterTokenId
      );
      const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
      const actualLoserBalance = await this.metarunCollection.balanceOf(this.loser, opalId);
      expect(actualLoserBalance).to.be.eq(expectedLoserBalance);
      const actualSecondBalance = await this.metarunCollection.balanceOf(this.second, opalId);
      expect(actualSecondBalance).to.be.eq(actualSecondBalance);
    });

    it("should revert for non-deployer", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      const attempt = this.runExecutor
        .connect(this.signers[1])
        .executeThreeParticipantsRun(
          this.winner,
          100,
          this.winnerCharacterTokenId,
          this.second,
          50,
          this.secondCharacterTokenId,
          this.loser,
          20,
          this.loserCharacterTokenId
        );
      await expect(attempt).to.be.revertedWith("RunExecutor: tx sender should have EXECUTOR_ROLE");
    });

    it("should revert for bad winner token id", async function () {
      await this.metarunCollection.mint(this.winner, this.badWinnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      const attempt = this.runExecutor.executeThreeParticipantsRun(
        this.winner,
        100,
        this.badWinnerCharacterTokenId,
        this.second,
        50,
        this.secondCharacterTokenId,
        this.loser,
        20,
        this.loserCharacterTokenId
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant's token id should be game token");
    });

    it("should revert for bad second token id", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.badSecondCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      const attempt = this.runExecutor.executeThreeParticipantsRun(
        this.winner,
        100,
        this.winnerCharacterTokenId,
        this.second,
        50,
        this.badSecondCharacterTokenId,
        this.loser,
        20,
        this.loserCharacterTokenId
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant's token id should be game token");
    });

    it("should revert for bad loser token id", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.badLoserCharacterTokenId, 1);
      const attempt = this.runExecutor.executeThreeParticipantsRun(
        this.winner,
        100,
        this.winnerCharacterTokenId,
        this.second,
        50,
        this.secondCharacterTokenId,
        this.loser,
        20,
        this.badLoserCharacterTokenId
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant's token id should be game token");
    });

    it("should revert for bad winner opal amount", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      const attempt = this.runExecutor.executeThreeParticipantsRun(
        this.winner,
        0,
        this.winnerCharacterTokenId,
        this.second,
        50,
        this.secondCharacterTokenId,
        this.loser,
        20,
        this.loserCharacterTokenId
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: winner's opal to be minted should be defined");
    });

    it("should revert if winner doesn't have a winner character", async function () {
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      const attempt = this.runExecutor.executeThreeParticipantsRun(
        this.winner,
        10,
        this.winnerCharacterTokenId,
        this.second,
        50,
        this.secondCharacterTokenId,
        this.loser,
        20,
        this.loserCharacterTokenId
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant should own its character");
    });

    it("should revert if second doesn't have a winner character", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      const attempt = this.runExecutor.executeThreeParticipantsRun(
        this.winner,
        10,
        this.winnerCharacterTokenId,
        this.second,
        50,
        this.secondCharacterTokenId,
        this.loser,
        20,
        this.loserCharacterTokenId
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant should own its character");
    });

    it("should revert if loser doesn't have a winner character", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      const attempt = this.runExecutor.executeThreeParticipantsRun(
        this.winner,
        10,
        this.winnerCharacterTokenId,
        this.second,
        50,
        this.secondCharacterTokenId,
        this.loser,
        20,
        this.loserCharacterTokenId
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant should own its character");
    });
  });
});
