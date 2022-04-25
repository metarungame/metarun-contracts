const { expect } = require("chai");
const { ethers } = require("hardhat");
const URI_TOKEN = "localhost/api/{id}.json";

describe("MetarunCollection | isKind functions", function () {
  function getTokenId() {
    return Math.floor((Math.random() * 100000) % 2 ** 16);
  }

  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
  });

  beforeEach(async function () {
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
  });

  describe("isCharacter function", function () {
    it("should correctly check for craftsman", async function () {
      const tokenKind = await this.metarunCollection.CRAFTSMAN_CHARACTER_KIND();
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isCharacter(tokenId);
      expect(result).to.be.true;
    });

    it("should correctly check for fighter", async function () {
      const tokenKind = await this.metarunCollection.FIGHTER_CHARACTER_KIND();
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isCharacter(tokenId);
      expect(result).to.be.true;
    });

    it("should correctly check for sprinter", async function () {
      const tokenKind = await this.metarunCollection.SPRINTER_CHARACTER_KIND();
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isCharacter(tokenId);
      expect(result).to.be.true;
    });

    it("should fail check for bad value", async function () {
      const tokenKind = 0xfff;
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isCharacter(tokenId);
      expect(result).to.be.false;
    });
  });

  describe("isArtifact function", function () {
    it("should correctly check artifact", async function () {
      const tokenKind = await this.metarunCollection.ARTIFACT_TOKEN_KIND();
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isArtifact(tokenId);
      expect(result).to.be.true;
    });

    it("should fail for bad value", async function () {
      const tokenKind = 0xfff;
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isArtifact(tokenId);
      expect(result).to.be.false;
    });
  });

  describe("isPet function", function () {
    it("should correctly check pet", async function () {
      const tokenKind = await this.metarunCollection.PET_TOKEN_KIND();
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isPet(tokenId);
      expect(result).to.be.true;
    });

    it("should fail for bad value", async function () {
      const tokenKind = 0xfff;
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isPet(tokenId);
      expect(result).to.be.false;
    });
  });

  describe("isSkin function", function () {
    it("should correctly check skin", async function () {
      const tokenKind = await this.metarunCollection.SKIN_TOKEN_KIND();
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isSkin(tokenId);
      expect(result).to.be.true;
    });

    it("should fail for bad value", async function () {
      const tokenKind = 0xfff;
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isSkin(tokenId);
      expect(result).to.be.false;
    });
  });

  describe("isRaffle function", function () {
    it("should correctly check raffle", async function () {
      const tokenKind = await this.metarunCollection.RAFFLE_TICKET_TOKEN_KIND();
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isRaffleTicket(tokenId);
      expect(result).to.be.true;
    });

    it("should fail for bad value", async function () {
      const tokenKind = 0xfff;
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isRaffleTicket(tokenId);
      expect(result).to.be.false;
    });
  });

  describe("isFungible function", function () {
    it("should correctly check fungible token of health", async function () {
      const token = await this.metarunCollection.HEALTH_TOKEN_ID();
      const result = await this.metarunCollection.isFungible(token);
      expect(result).to.be.true;
    });

    it("should correctly check fungible token of mana", async function () {
      const token = await this.metarunCollection.MANA_TOKEN_ID();
      const result = await this.metarunCollection.isFungible(token);
      expect(result).to.be.true;
    });

    it("should correctly check fungible token of speed", async function () {
      const token = await this.metarunCollection.SPEED_TOKEN_ID();
      const result = await this.metarunCollection.isFungible(token);
      expect(result).to.be.true;
    });

    it("should correctly check fungible token of collision damage", async function () {
      const token = await this.metarunCollection.COLLISION_DAMAGE_TOKEN_ID();
      const result = await this.metarunCollection.isFungible(token);
      expect(result).to.be.true;
    });

    it("should fail for bad value", async function () {
      const tokenKind = 0xfff;
      const tokenId = (tokenKind << 16) + 1;
      const result = await this.metarunCollection.isFungible(tokenId);
      expect(result).to.be.false;
    });
  });
});
