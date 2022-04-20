const { expect } = require("chai");
const { ethers } = require("hardhat");
const URI_TOKEN = "localhost/api/{id}.json";

describe("MetarunCollection | Manage level of pets and characters", function () {
  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
  });

  beforeEach(async function () {
    this.metarunCollection = await this.metarunCollectionFactory.deploy(URI_TOKEN);
    this.signers = await ethers.getSigners();
    this.characterOwner = this.signers[1];
    this.characterTokenId = 0x00020001;
    await this.metarunCollection.mint(this.characterOwner.address, this.characterTokenId, 1);
    this.petOwner = this.signers[1];
    this.petTokenId = 0x02000001;
    await this.metarunCollection.mint(this.petOwner.address, this.petTokenId, 1);
  });

  describe("Character level", function () {
    it("should correctly give level", async function () {
      const level = await this.metarunCollection.getLevel(this.characterTokenId);
      expect(level).to.be.eq(0);
    });

    it("should correctly give level for non-LEVEL_SETTER_ROLE", async function () {
      const level = await this.metarunCollection.connect(this.characterOwner).getLevel(this.characterTokenId);
      expect(level).to.be.eq(0);
    });

    it("should correctly set level", async function () {
      const level = 1337;
      await this.metarunCollection.setLevel(this.characterTokenId, level);
      const levelFromContract = await this.metarunCollection.getLevel(this.characterTokenId);
      expect(levelFromContract).to.be.eq(level);
    });

    it("should deny set level for non-LEVEL_SETTER_ROLE", async function () {
      const level = 100;
      const attemptToSetLevel = this.metarunCollection.connect(this.characterOwner).setLevel(this.characterTokenId, level);
      await expect(attemptToSetLevel).to.be.revertedWith("METARUNCOLLECTION: need LEVEL_SETTER_ROLE");
    });
  });

  describe("Pet level", function () {
    it("should correctly give level", async function () {
      const level = await this.metarunCollection.getLevel(this.petTokenId);
      expect(level).to.be.eq(0);
    });

    it("should correctly give level for non-LEVEL_SETTER_ROLE", async function () {
      const level = await this.metarunCollection.connect(this.petOwner).getLevel(this.petTokenId);
      expect(level).to.be.eq(0);
    });

    it("should correctly set level", async function () {
      const level = 123;
      await this.metarunCollection.setLevel(this.petTokenId, level);
      const levelFromContract = await this.metarunCollection.getLevel(this.petTokenId);
      expect(levelFromContract).to.be.eq(level);
    });

    it("should deny set level for non-LEVEL_SETTER_ROLE", async function () {
      const level = 129;
      const attemptToSetLevel = this.metarunCollection.connect(this.petOwner).setLevel(this.petTokenId, level);
      await expect(attemptToSetLevel).to.be.revertedWith("METARUNCOLLECTION: need LEVEL_SETTER_ROLE");
    });
  });
});
