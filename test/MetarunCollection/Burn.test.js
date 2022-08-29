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
    this.commonCharacterKind = await this.metarunCollection.IGNIS_CLASSIC_COMMON();
    this.commonCharacterId = 0x000106000003;
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.stranger = this.signers[1];
    this.recipient = this.signers[2];
  });

  it("should burn token", async function () {
    await this.metarunCollection.mint(this.recipient.address, this.commonCharacterId, 1);
    await this.metarunCollection.connect(this.recipient).burn(this.recipient.address, this.commonCharacterId, 1);
    const exists = await this.metarunCollection.exists(this.commonCharacterId);
    expect(exists).to.be.false;
  });

  it("should fail burn for stranger", async function () {
    await this.metarunCollection.mint(this.recipient.address, this.commonCharacterId, 1);
    const attempt = this.metarunCollection.connect(this.stranger).burn(this.recipient.address, this.commonCharacterId, 1);
    await expect(attempt).to.be.revertedWith("ERC1155: caller is not owner nor approved");
  });

  it("should burn batch-minted tokens", async function () {
    const commonCharacterIds = [];
    const amount = 20;
    for (let i = 0; i < amount; i++) {
      commonCharacterIds.push(this.commonCharacterId + i);
    }
    await this.metarunCollection.mintBatch(this.recipient.address, this.commonCharacterKind, 20);
    await this.metarunCollection.connect(this.recipient).burn(this.recipient.address, commonCharacterIds[13], 1);
    const exists = await this.metarunCollection.exists(commonCharacterIds[13]);
    expect(exists).to.be.false;
  });

  it("should burn batch tokens", async function () {
    await this.metarunCollection.mint(this.recipient.address, this.commonCharacterId, 1);
    await this.metarunCollection.connect(this.recipient).burnBatch(this.recipient.address, [this.commonCharacterId], [1]);
    const exists = await this.metarunCollection.exists(this.commonCharacterId);
    expect(exists).to.be.false;
  });
});
