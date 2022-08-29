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

  describe("isGameToken function", function () {
    it("should correctly check for Ignis", async function () {
      const tokenId = 0x000106000003;
      const result = await this.metarunCollection.isGameToken(tokenId);
      expect(result).to.be.true;
    });

    it("should correctly check for Penna", async function () {
      const tokenId = 0x000206000003;
      const result = await this.metarunCollection.isGameToken(tokenId);
      expect(result).to.be.true;
    });

    it("should correctly check for Oro", async function () {
      const tokenId = 0x000306000003;
      const result = await this.metarunCollection.isGameToken(tokenId);
      expect(result).to.be.true;
    });

    it("should fail check for bad value", async function () {
      const tokenKind = 0xfff;
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isGameToken(tokenId);
      expect(result).to.be.false;
    });
  });

  describe("isArtifact function", function () {
    it("should correctly check artifact", async function () {
      const tokenKind = await this.metarunCollection.ARTIFACT_TOKEN_KIND();
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isKind(tokenId, tokenKind);
      expect(result).to.be.true;
    });
  });

  describe("isPet function", function () {
    it("should correctly check pet", async function () {
      const tokenKind = await this.metarunCollection.PET_TOKEN_KIND();
      const tokenId = (tokenKind << 16) | getTokenId();
      const result = await this.metarunCollection.isKind(tokenId, tokenKind);
      expect(result).to.be.true;
    });
  });

  describe("isFungible function", function () {
    this.beforeAll(async function () {
      this.fungibleTokenKind = await this.metarunCollection.FUNGIBLE_TOKEN_KIND();
    });

    it("should correctly check fungible token of health", async function () {
      const token = await this.metarunCollection.HEALTH_TOKEN_ID();
      const result = await this.metarunCollection.isKind(token, this.fungibleTokenKind);
      expect(result).to.be.true;
    });

    it("should correctly check fungible token of mana", async function () {
      const token = await this.metarunCollection.MANA_TOKEN_ID();
      const result = await this.metarunCollection.isKind(token, this.fungibleTokenKind);
      expect(result).to.be.true;
    });

    it("should correctly check fungible token of speed", async function () {
      const token = await this.metarunCollection.SPEED_TOKEN_ID();
      const result = await this.metarunCollection.isKind(token, this.fungibleTokenKind);
      expect(result).to.be.true;
    });

    it("should correctly check fungible token of collision damage", async function () {
      const token = await this.metarunCollection.COLLISION_DAMAGE_TOKEN_ID();
      const result = await this.metarunCollection.isKind(token, this.fungibleTokenKind);
      expect(result).to.be.true;
    });
  });

  describe("getType function", function () {
    this.beforeAll(async function () {
      this.fungibleTokenKind = await this.metarunCollection.FUNGIBLE_TOKEN_KIND();
      this.characterTokenKind = await this.metarunCollection.PENNA_CLASSIC_COMMON();
    });

    it("should correctly check for character token", async function () {
      const tokenId = 0x000206000003;
      const result = await this.metarunCollection.getType(tokenId);
      expect(result).to.be.equal(this.characterTokenKind >> 16);
    });

    it("should correctly check for non-character token", async function () {
      const tokenId = (this.fungibleTokenKind << 16) | 3;
      const result = await this.metarunCollection.getType(tokenId);
      expect(result).to.be.equal(0x0000);
    });
  });
});
