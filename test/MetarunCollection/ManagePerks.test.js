const { expect } = require("chai");
const { ethers } = require("hardhat");
const URI_TOKEN = "localhost/api/{id}.json";

const level = 10;
const runs = 15;
const wins = 7;
const ability = 100;
const health = 11;
const mana = 1234;
const speed = 100;
const collisionDamage = 15;
const values = { level, runs, wins, ability, health, mana, speed, collisionDamage };

describe("MetarunCollection | Manage perks of pets and characters", function () {
  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
  });

  beforeEach(async function () {
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
    this.signers = await ethers.getSigners();
    this.characterOwner = this.signers[1];
    this.characterTokenId = 0x00020001;
    await this.metarunCollection.mint(this.characterOwner.address, this.characterTokenId, 1);
    this.petOwner = this.signers[1];
    this.petTokenId = 0x02000001;
    await this.metarunCollection.mint(this.petOwner.address, this.petTokenId, 1);
  });

  describe("Character perks", function () {
    it("should correctly give perks", async function () {
      const perks = await this.metarunCollection.getPerks(this.characterTokenId);
      expect(perks.level).to.be.eq(0);
      expect(perks.ability).to.be.eq(0);
      expect(perks.runs).to.be.eq(0);
      expect(perks.wins).to.be.eq(0);
      expect(perks.health).to.be.eq(0);
      expect(perks.mana).to.be.eq(0);
      expect(perks.speed).to.be.eq(0);
      expect(perks.collisionDamage).to.be.eq(0);
    });

    it("should correctly give perks for non-SETTER_ROLE", async function () {
      const perks = await this.metarunCollection.connect(this.characterOwner).getPerks(this.characterTokenId);
      expect(perks.level).to.be.eq(0);
      expect(perks.ability).to.be.eq(0);
      expect(perks.runs).to.be.eq(0);
      expect(perks.wins).to.be.eq(0);
      expect(perks.health).to.be.eq(0);
      expect(perks.mana).to.be.eq(0);
      expect(perks.speed).to.be.eq(0);
      expect(perks.collisionDamage).to.be.eq(0);
    });

    it("should correctly set perks", async function () {
      await this.metarunCollection.setPerks(this.characterTokenId, values);
      const perks = await this.metarunCollection.getPerks(this.characterTokenId);
      expect(perks.level).to.be.eq(level);
      expect(perks.ability).to.be.eq(ability);
      expect(perks.runs).to.be.eq(runs);
      expect(perks.wins).to.be.eq(wins);
      expect(perks.health).to.be.eq(health);
      expect(perks.mana).to.be.eq(mana);
      expect(perks.speed).to.be.eq(speed);
      expect(perks.collisionDamage).to.be.eq(collisionDamage);
    });

    it("should deny set perks for non-SETTER_ROLE", async function () {
      const attemptToSetPerks = this.metarunCollection.connect(this.characterOwner).setPerks(this.characterTokenId, values);
      await expect(attemptToSetPerks).to.be.revertedWith("need SETTER_ROLE");
    });
  });

  describe("Pet perks", function () {
    it("should correctly give perks", async function () {
      const perks = await this.metarunCollection.getPerks(this.petTokenId);
      expect(perks.level).to.be.eq(0);
      expect(perks.ability).to.be.eq(0);
      expect(perks.runs).to.be.eq(0);
      expect(perks.wins).to.be.eq(0);
      expect(perks.health).to.be.eq(0);
      expect(perks.mana).to.be.eq(0);
      expect(perks.speed).to.be.eq(0);
      expect(perks.collisionDamage).to.be.eq(0);
    });

    it("should correctly give level for non-SETTER_ROLE", async function () {
      const perks = await this.metarunCollection.connect(this.petOwner).getPerks(this.petTokenId);
      expect(perks.level).to.be.eq(0);
      expect(perks.ability).to.be.eq(0);
      expect(perks.runs).to.be.eq(0);
      expect(perks.wins).to.be.eq(0);
      expect(perks.health).to.be.eq(0);
      expect(perks.mana).to.be.eq(0);
      expect(perks.speed).to.be.eq(0);
      expect(perks.collisionDamage).to.be.eq(0);
    });

    it("should correctly set perks", async function () {
      await this.metarunCollection.setPerks(this.petTokenId, values);
      const perks = await this.metarunCollection.getPerks(this.petTokenId);
      expect(perks.level).to.be.eq(level);
      expect(perks.ability).to.be.eq(ability);
      expect(perks.runs).to.be.eq(runs);
      expect(perks.wins).to.be.eq(wins);
      expect(perks.health).to.be.eq(health);
      expect(perks.mana).to.be.eq(mana);
      expect(perks.speed).to.be.eq(speed);
      expect(perks.collisionDamage).to.be.eq(collisionDamage);
    });

    it("should deny set perks for non-SETTER_ROLE", async function () {
      const attemptToSetPerks = this.metarunCollection.connect(this.petOwner).setPerks(this.petTokenId, values);
      await expect(attemptToSetPerks).to.be.revertedWith("need SETTER_ROLE");
    });
  });
});
