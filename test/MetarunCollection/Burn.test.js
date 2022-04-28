const { expect } = require("chai");
const { ethers } = require("hardhat");
const URI_TOKEN = "localhost:8000/api/{id}.json";

describe("MetarunCollection | burn tokens", function () {
  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
  });

  beforeEach(async function () {
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
    await this.metarunCollection.deployed();
    this.skinKind = await this.metarunCollection.COMMON_SKIN_KIND();
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.stranger = this.signers[1];
    this.recipient = this.signers[2];
  });

  it("should burn token", async function () {
    const skinTokenId = (this.skinKind << 16) | 3;
    await this.metarunCollection.mint(this.recipient.address, skinTokenId, 1);
    await this.metarunCollection.connect(this.recipient).burn(this.recipient.address, skinTokenId, 1);
    const exists = await this.metarunCollection.exists(skinTokenId);
    expect(exists).to.be.false;
  });

  it("should fail burn for stranger", async function () {
    const skinTokenId = (this.skinKind << 16) | 3;
    await this.metarunCollection.mint(this.recipient.address, skinTokenId, 1);
    const attempt = this.metarunCollection.connect(this.stranger).burn(this.recipient.address, skinTokenId, 1);
    await expect(attempt).to.be.revertedWith("ERC1155: caller is not owner nor approved");
  });

  it("should burn batch-minted tokens", async function () {
    const skinTokenIds = [];
    const amount = 20;
    for (let i = 0; i < amount; i++) {
      skinTokenIds.push((this.skinKind << 16) | i);
    }
    await this.metarunCollection.mintBatch(this.recipient.address, this.skinKind, 20);
    for (let i = 0; i < amount; i++) {
      await this.metarunCollection.connect(this.recipient).burn(this.recipient.address, skinTokenIds[i], 1);
      const exists = await this.metarunCollection.exists(skinTokenIds[i]);
      expect(exists).to.be.false;
    }
  });

  it("should burn batch tokens", async function () {
    const skinTokenIds = [];
    const amounts = [];
    const amount = 20;
    for (let i = 0; i < amount; i++) {
      skinTokenIds.push((this.skinKind << 16) | i);
      amounts.push(1);
    }
    await this.metarunCollection.mintBatch(this.recipient.address, this.skinKind, 20);
    await this.metarunCollection.connect(this.recipient).burnBatch(this.recipient.address, skinTokenIds, amounts);
    for (let i = 0; i < amount; i++) {
      const exists = await this.metarunCollection.exists(skinTokenIds[i]);
      expect(exists).to.be.false;
    }
  });
});
