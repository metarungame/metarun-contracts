const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const URI_TOKEN = "localhost/api/{id}.json";

describe("MetarunCollection | getters and setters of Character properties", function () {
  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.signers = await ethers.getSigners();
    this.characterOwner = this.signers[2];
    this.characterId = 0x000106000003;
  });

  beforeEach(async function () {
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
    this.metarunCollection.mint(this.characterOwner.address, this.characterId, 1);
  });

  it("should set perks properly", async function () {
    const level = 10;
    const runs = 15;
    const wins = 7;
    const ability = 100;
    const health = 11;
    const mana = 1234;
    const speed = 100;
    const collisionDamage = 15;
    const runsPerDayLimit = 10;
    const runsTotalLimit = 200;
    const values = { level, runs, wins, ability, health, mana, speed, collisionDamage, runsPerDayLimit, runsTotalLimit };
    await this.metarunCollection.setPerks(this.characterId, values);
    const valuesInContract = await this.metarunCollection.getPerks(this.characterId);
    expect(valuesInContract.health).to.be.eq(health);
    expect(valuesInContract.mana).to.be.eq(mana);
    expect(valuesInContract.speed).to.be.eq(speed);
    expect(valuesInContract.collisionDamage).to.be.eq(collisionDamage);
  });
});
