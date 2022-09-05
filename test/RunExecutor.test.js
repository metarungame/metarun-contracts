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

    this.winnerCharacterTokenId = 0x0000106010001;
    this.secondCharacterTokenId = 0x000207020002;
    this.loserCharacterTokenId = 0x000308020003;
    this.badWinnerCharacterTokenId = ((await this.metarunCollection.ARTIFACT_TOKEN_KIND()) << 16) + 1;
    this.badSecondCharacterTokenId = ((await this.metarunCollection.ARTIFACT_TOKEN_KIND()) << 16) + 2;
    this.badLoserCharacterTokenId = ((await this.metarunCollection.ARTIFACT_TOKEN_KIND()) << 16) + 3;

    this.winnerInfo = {
      adds: this.winner,
      opal: 100,
      tokenId: this.winnerCharacterTokenId,
    };

    this.secondInfo = {
      adds: this.second,
      opal: 50,
      tokenId: this.secondCharacterTokenId,
    };

    this.loserInfo = {
      adds: this.loser,
      opal: 5,
      tokenId: this.loserCharacterTokenId,
    };

    this.botInfo = {
      adds: ZERO_ADDRESS,
      opal: 0,
      tokenId: 0,
    };

    this.winnerPerks = {
      level: 1,
      runs: 1,
      wins: 1,
      ability: 1,
      health: 1,
      mana: 1,
      speed: 1,
      collisionDamage: 1,
      runsPerDayLimit: 1,
      runsTotalLimit: 1,
    };

    this.secondPerks = {
      level: 1,
      runs: 1,
      wins: 1,
      ability: 1,
      health: 1,
      mana: 1,
      speed: 1,
      collisionDamage: 1,
      runsPerDayLimit: 1,
      runsTotalLimit: 1,
    };

    this.loserPerks = {
      level: 1,
      runs: 1,
      wins: 1,
      ability: 1,
      health: 1,
      mana: 1,
      speed: 1,
      collisionDamage: 1,
      runsPerDayLimit: 1,
      runsTotalLimit: 1,
    };
  });

  describe("Check initialization", function () {
    it("zero address validation", async function () {
      const attempt = upgrades.deployProxy(this.runExecutorFactory, [ZERO_ADDRESS])
      await expect(attempt).to.be.revertedWith("ZERO_COLLECTION_ADDR");
    })
  })

  describe("Run with two participants", function () {
    it("should perform a run successfully", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      await this.runExecutor.executeRun(this.winnerInfo, this.winnerPerks, this.loserInfo, this.loserPerks);
      const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
      const actualWinnerBalance = await this.metarunCollection.balanceOf(this.winner, opalId);
      const actualLoserBalance = await this.metarunCollection.balanceOf(this.loser, opalId);
      expect(actualWinnerBalance).to.be.eq(this.winnerInfo.opal);
      expect(actualLoserBalance).to.be.eq(this.loserInfo.opal);
    });

    it("should perform a run with a losing bot successfully", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      this.runExecutor.executeRun(this.winnerInfo, this.winnerPerks, this.botInfo, this.loserPerks);
      const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
      const actualWinnerBalance = await this.metarunCollection.balanceOf(this.winner, opalId);
      expect(actualWinnerBalance).to.be.eq(this.winnerInfo.opal);
    });

    it("should perform a run with a winning bot successfully", async function () {
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      this.runExecutor.executeRun(this.botInfo, this.winnerPerks, this.loserInfo, this.loserPerks);
      const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
      const actualLoserBalance = await this.metarunCollection.balanceOf(this.loser, opalId);
      expect(actualLoserBalance).to.be.eq(this.loserInfo.opal);
    });

    it("should revert for non-deployer", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      const attempt = this.runExecutor.connect(this.signers[1]).executeRun(this.winnerInfo, this.winnerPerks, this.loserInfo, this.loserPerks);
      await expect(attempt).to.be.revertedWith("RunExecutor: tx sender should have EXECUTOR_ROLE");
    });

    it("should revert for bad winner token id", async function () {
      await this.metarunCollection.mint(this.winner, this.badWinnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      const attempt = this.runExecutor.executeRun(
        { adds: this.winner, opal: 100, tokenId: this.badWinnerCharacterTokenId },
        this.winnerPerks,
        this.loserInfo,
        this.loserPerks
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant's token id should be game token");
    });

    it("should revert for bad loser token id", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.badLoserCharacterTokenId, 1);
      const attempt = this.runExecutor.executeRun(
        this.winnerInfo,
        this.winnerPerks,
        { adds: this.loser, opal: 20, tokenId: this.badLoserCharacterTokenId },
        this.loserPerks
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant's token id should be game token");
    });

    it("should revert for bad winner opal amount", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      const attempt = this.runExecutor.executeRun(
        { adds: this.winner, opal: 0, tokenId: this.winnerCharacterTokenId },
        this.winnerPerks,
        this.loserInfo,
        this.loserPerks
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: winner's opal to be minted should be defined");
    });

    it("should revert if winner doesn't have a winner character", async function () {
      await this.metarunCollection.mint(this.loser, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.winner, this.loserCharacterTokenId, 1);
      const attempt = this.runExecutor.executeRun(this.winnerInfo, this.winnerPerks, this.loserInfo, this.loserPerks);
      await expect(attempt).to.be.revertedWith("RunExecutor: participant should own its character");
    });

    it("should revert if loser doesn't have a loser character", async function () {
      const dummyLoserCharacterTokenId = this.loserCharacterTokenId + 100;
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1); // dummy value on mint
      const attempt = this.runExecutor.executeRun(
        this.winnerInfo,
        this.winnerPerks,
        { adds: this.loser, opal: 10, tokenId: dummyLoserCharacterTokenId },
        this.loserPerks
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant should own its character");
    });
  });

  describe("Run with three participants", function () {
    it("should perform a run successfully", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      await this.runExecutor.executeThreeParticipantsRun(
        this.winnerInfo,
        this.winnerPerks,
        this.secondInfo,
        this.secondPerks,
        this.loserInfo,
        this.loserPerks
      );
      const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
      const actualWinnerBalance = await this.metarunCollection.balanceOf(this.winner, opalId);
      const actualSecondBalance = await this.metarunCollection.balanceOf(this.second, opalId);
      const actualLoserBalance = await this.metarunCollection.balanceOf(this.loser, opalId);
      expect(actualWinnerBalance).to.be.eq(this.winnerInfo.opal);
      expect(actualSecondBalance).to.be.eq(this.secondInfo.opal);
      expect(actualLoserBalance).to.be.eq(this.loserInfo.opal);
    });

    it("should perform a run with a losing bot successfully", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      this.runExecutor.executeThreeParticipantsRun(
        this.winnerInfo,
        this.winnerPerks,
        this.secondInfo,
        this.secondPerks,
        this.botInfo,
        this.loserPerks
      );
      const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
      const actualWinnerBalance = await this.metarunCollection.balanceOf(this.winner, opalId);
      const actualSecondBalance = await this.metarunCollection.balanceOf(this.second, opalId);
      expect(actualWinnerBalance).to.be.eq(this.winnerInfo.opal);
      expect(actualSecondBalance).to.be.eq(this.secondInfo.opal);
    });

    it("should perform a run with a winning bot successfully", async function () {
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      this.runExecutor.executeThreeParticipantsRun(
        this.botInfo,
        this.winnerPerks,
        this.secondInfo,
        this.secondPerks,
        this.loserInfo,
        this.loserPerks
      );
      const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
      const actualLoserBalance = await this.metarunCollection.balanceOf(this.loser, opalId);
      expect(actualLoserBalance).to.be.eq(this.loserInfo.opal);
      const actualSecondBalance = await this.metarunCollection.balanceOf(this.second, opalId);
      expect(actualSecondBalance).to.be.eq(this.secondInfo.opal);
    });

    it("should revert for non-deployer", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      const attempt = this.runExecutor
        .connect(this.signers[1])
        .executeThreeParticipantsRun(this.winnerInfo, this.winnerPerks, this.secondInfo, this.secondPerks, this.loserInfo, this.loserPerks);
      await expect(attempt).to.be.revertedWith("RunExecutor: tx sender should have EXECUTOR_ROLE");
    });

    it("should revert for bad winner token id", async function () {
      await this.metarunCollection.mint(this.winner, this.badWinnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      const attempt = this.runExecutor.executeThreeParticipantsRun(
        { adds: this.winner, opal: 100, tokenId: this.badWinnerCharacterTokenId },
        this.winnerPerks,
        this.secondInfo,
        this.secondPerks,
        this.loserInfo,
        this.loserPerks
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant's token id should be game token");
    });

    it("should revert for bad second token id", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.badSecondCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      const attempt = this.runExecutor.executeThreeParticipantsRun(
        this.winnerInfo,
        this.winnerPerks,
        { adds: this.second, opal: 50, tokenId: this.badSecondCharacterTokenId },
        this.secondPerks,
        this.loserInfo,
        this.loserPerks
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant's token id should be game token");
    });

    it("should revert for bad loser token id", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.badLoserCharacterTokenId, 1);
      const attempt = this.runExecutor.executeThreeParticipantsRun(
        this.winnerInfo,
        this.winnerPerks,
        this.secondInfo,
        this.secondPerks,
        { adds: this.loser, opal: 20, tokenId: this.badLoserCharacterTokenId },
        this.loserPerks
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant's token id should be game token");
    });

    it("should revert for bad winner opal amount", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      const attempt = this.runExecutor.executeThreeParticipantsRun(
        { adds: this.winner, opal: 0, tokenId: this.winnerCharacterTokenId },
        this.winnerPerks,
        this.secondInfo,
        this.secondPerks,
        this.loserInfo,
        this.loserPerks
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: winner's opal to be minted should be defined");
    });

    it("should revert if winner doesn't have a winner character", async function () {
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      const attempt = this.runExecutor.executeThreeParticipantsRun(
        this.winnerInfo,
        this.winnerPerks,
        this.secondInfo,
        this.secondPerks,
        this.loserInfo,
        this.loserPerks
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant should own its character");
    });

    it("should revert if second doesn't have a winner character", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.loser, this.loserCharacterTokenId, 1);
      const attempt = this.runExecutor.executeThreeParticipantsRun(
        this.winnerInfo,
        this.winnerPerks,
        this.secondInfo,
        this.secondPerks,
        this.loserInfo,
        this.loserPerks
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant should own its character");
    });

    it("should revert if loser doesn't have a winner character", async function () {
      await this.metarunCollection.mint(this.winner, this.winnerCharacterTokenId, 1);
      await this.metarunCollection.mint(this.second, this.secondCharacterTokenId, 1);
      const attempt = this.runExecutor.executeThreeParticipantsRun(
        this.winnerInfo,
        this.winnerPerks,
        this.secondInfo,
        this.secondPerks,
        this.loserInfo,
        this.loserPerks
      );
      await expect(attempt).to.be.revertedWith("RunExecutor: participant should own its character");
    });
  });
});
