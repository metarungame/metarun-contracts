const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const URI_TOKEN = "localhost/api/{id}.json";

describe("MetarunCollection | getters and setters of Character properties", function () {
  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.signers = await ethers.getSigners();
    this.characterOwner = this.signers[2];
    this.characterId = (0x0002 << 16) | 0xfa01;
  });

  beforeEach(async function () {
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
    this.metarunCollection.mint(this.characterOwner.address, this.characterId, 1);
  });

  it("should set level properly", async function () {
    const value = 10;
    await this.metarunCollection.setLevel(this.characterId, value);
    const valueInContract = await this.metarunCollection.getLevel(this.characterId);
    expect(valueInContract).to.be.eq(value);
  });

  it("should set runs count properly", async function () {
    const value = 11;
    await this.metarunCollection.setRunCount(this.characterId, value);
    const valueInContract = await this.metarunCollection.getRunCount(this.characterId);
    expect(valueInContract).to.be.eq(value);
  });

  it("should set wins count properly", async function () {
    const value = 12;
    await this.metarunCollection.setWinCount(this.characterId, value);
    const valueInContract = await this.metarunCollection.getWinCount(this.characterId);
    expect(valueInContract).to.be.eq(value);
  });

  it("should set ability properly", async function () {
    const value = 13;
    await this.metarunCollection.setAbility(this.characterId, value);
    const valueInContract = await this.metarunCollection.getAbility(this.characterId);
    expect(valueInContract).to.be.eq(value);
  });

  it("should set perks properly", async function () {
    const values = [14, 15, 16, 17];
    await this.metarunCollection.setPerks(this.characterId, values);
    const valuesInContract = await this.metarunCollection.getPerks(this.characterId);
    expect(valuesInContract[0]).to.be.eq(values[0]);
    expect(valuesInContract[1]).to.be.eq(values[1]);
    expect(valuesInContract[2]).to.be.eq(values[2]);
    expect(valuesInContract[3]).to.be.eq(values[3]);
  });
});
