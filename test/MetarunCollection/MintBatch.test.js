const { expect } = require("chai");
const { ethers } = require("hardhat");
const URI_TOKEN = "localhost:8000/api/{id}.json";

describe("MetarunCollection | mintBatch() function", function () {
  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
  });

  beforeEach(async function () {
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
    await this.metarunCollection.deployed();
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.stranger = this.signers[1];
    this.recipient = this.signers[2];
  });

  it("should properly mint a lot of tokens", async function () {
    const skinKind = await this.metarunCollection.SKIN_TOKEN_KIND();
    const amount = 10;
    let skinIds = [];
    for (let i = 0; i < amount; i++) {
      skinIds[i] = (skinKind << 16) | i;
    }
    await this.metarunCollection.mintBatch(this.recipient.address, skinKind, amount);
    for (let i = 0; i < amount; i++) {
      const balance = await this.metarunCollection.balanceOf(this.recipient.address, skinIds[i]);
      expect(balance).to.be.eq(1);
    }
  });

  it("should properly mint batch after batch", async function () {
    const skinKind = await this.metarunCollection.SKIN_TOKEN_KIND();
    const amount = 20;
    let skinIds = [];
    for (let i = 0; i < amount; i++) {
      skinIds[i] = (skinKind << 16) | i;
    }
    await this.metarunCollection.mintBatch(this.recipient.address, skinKind, amount / 2);
    await this.metarunCollection.mintBatch(this.recipient.address, skinKind, amount / 2);
    for (let i = 0; i < amount; i++) {
      const balance = await this.metarunCollection.balanceOf(this.recipient.address, skinIds[i]);
      expect(balance).to.be.eq(1);
    }
  });

  it("should properly mint in batch-single-batch mint schema", async function () {
    const skinKind = await this.metarunCollection.SKIN_TOKEN_KIND();
    const amount = 21;
    let skinIds = [];
    for (let i = 0; i < amount; i++) {
      if (i == 10) continue;
      skinIds[i] = (skinKind << 16) | i;
    }
    const tokenIdOfSingle = (skinKind << 16) | 10;

    await this.metarunCollection.mintBatch(this.recipient.address, skinKind, Math.floor(amount / 2));
    await this.metarunCollection.mint(this.recipient.address, tokenIdOfSingle, 1);
    await this.metarunCollection.mintBatch(this.recipient.address, skinKind, Math.floor(amount / 2));

    for (let i = 0; i < amount; i++) {
      if (i == 10) continue;
      const balance = await this.metarunCollection.balanceOf(this.recipient.address, skinIds[i]);
      const tokenSupply = await this.metarunCollection.totalSupply(skinIds[i]);
      expect(balance).to.be.eq(1);
      expect(tokenSupply).to.be.eq(1);
    }
    const balanceOfSingle = await this.metarunCollection.balanceOf(this.recipient.address, tokenIdOfSingle);
    const tokenSupplyOfSingle = await this.metarunCollection.totalSupply(tokenIdOfSingle);
    expect(balanceOfSingle).to.be.eq(1);
    expect(tokenSupplyOfSingle).to.be.eq(1);
  });
});
