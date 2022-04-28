const { expect } = require("chai");
const { ethers } = require("hardhat");

const URI_TOKEN = "localhost/api/{id}.json";

describe("MetarunCollection | Token URI handling", function () {
  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.signers = await ethers.getSigners();
    this.stranger = this.signers[1];
  });

  beforeEach(async function () {
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
  });

  it("should give token uri correctly", async function () {
    const skinKind = await this.metarunCollection.COMMON_SKIN_KIND();
    const tokenId = (skinKind << 16) | 3;
    const tokenURI = await this.metarunCollection.uri(tokenId);
    expect(tokenURI).to.be.eq(URI_TOKEN);
  });

  it("should change token uri when admin", async function () {
    const skinKind = await this.metarunCollection.COMMON_SKIN_KIND();
    const tokenId = (skinKind << 16) | 3;

    const tokenURIBefore = await this.metarunCollection.uri(tokenId);
    expect(tokenURIBefore).to.be.eq(URI_TOKEN);

    const changedURI = "new.host/api/metadata/{id}.json";
    await this.metarunCollection.setURI(changedURI);

    const tokenURIAfter = await this.metarunCollection.uri(tokenId);
    expect(tokenURIAfter).to.be.eq(changedURI);
  });

  it("should deny change token uri when stranger", async function () {
    const skinKind = await this.metarunCollection.COMMON_SKIN_KIND();
    const tokenId = (skinKind << 16) | 3;

    const tokenURIBefore = await this.metarunCollection.connect(this.stranger).uri(tokenId);
    expect(tokenURIBefore).to.be.eq(URI_TOKEN);

    const changedURI = "new.host/api/metadata/{id}.json";
    const attemptToChange = this.metarunCollection.connect(this.stranger).setURI(changedURI);
    expect(attemptToChange).to.be.revertedWith("need DEFAULT_ADMIN_ROLE");

    const tokenURIAfter = await this.metarunCollection.connect(this.stranger).uri(tokenId);
    expect(tokenURIAfter).to.be.eq(URI_TOKEN);
  });
});
