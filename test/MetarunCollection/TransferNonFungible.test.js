const { expect } = require("chai");
const { ethers } = require("hardhat");
const URI_TOKEN = "localhost/api/{id}.json";

describe("MetarunCollection | Non-fungible token transfer", async function () {
  function getTokenId() {
    return Math.floor((Math.random() * 100000) % 2 ** 16);
  }

  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.metarunCollection = await this.metarunCollectionFactory.deploy(URI_TOKEN);
    await this.metarunCollection.deployed();
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.stranger = this.signers[1];
    this.recipient = this.signers[2];

    this.nonFungibleTokenTransferTestCase = async (tokenId, tokenKind) => {
      const isKindCheck = await this.metarunCollection.isKind(tokenId, tokenKind);
      const isFungibleCheck = await this.metarunCollection.isFungible(tokenId);
      expect(isKindCheck).to.be.eq(true);
      expect(isFungibleCheck).to.be.eq(false);

      await this.metarunCollection.connect(this.deployer).mint(this.stranger.address, tokenId, 1);
      await this.metarunCollection.connect(this.stranger).safeTransferFrom(this.stranger.address, this.recipient.address, tokenId, 1, []);

      const senderBalance = await this.metarunCollection.balanceOf(this.stranger.address, tokenId);
      const receiverBalance = await this.metarunCollection.balanceOf(this.recipient.address, tokenId);

      expect(senderBalance).to.be.eq(0);
      expect(receiverBalance).to.be.eq(1);
    };
  });

  it("should transfer character craftsman token", async function () {
    const tokenId = (0x0000 << 16) | getTokenId();
    const tokenKind = await this.metarunCollection.CRAFTSMAN_CHARACTER_KIND();
    await this.nonFungibleTokenTransferTestCase(tokenId, tokenKind);
  });

  it("should transfer character fighter token", async function () {
    const tokenId = (0x0001 << 16) | getTokenId();
    const tokenKind = await this.metarunCollection.FIGHTER_CHARACTER_KIND();
    await this.nonFungibleTokenTransferTestCase(tokenId, tokenKind);
  });

  it("should transfer character sprinter token", async function () {
    const tokenId = (0x0002 << 16) | getTokenId();
    const tokenKind = await this.metarunCollection.SPRINTER_CHARACTER_KIND();
    await this.nonFungibleTokenTransferTestCase(tokenId, tokenKind);
  });

  it("should transfer artifact token", async function () {
    const tokenId = (0x0100 << 16) | getTokenId();
    const tokenKind = await this.metarunCollection.ARTIFACT_TOKEN_KIND();
    this.nonFungibleTokenTransferTestCase(tokenId, tokenKind);
  });

  it("should transfer pet token", async function () {
    const tokenId = (0x0200 << 16) | getTokenId();
    const tokenKind = await this.metarunCollection.PET_TOKEN_KIND();
    this.nonFungibleTokenTransferTestCase(tokenId, tokenKind);
  });

  it("should transfer skin token", async function () {
    const tokenId = (0x0300 << 16) | getTokenId();
    const tokenKind = await this.metarunCollection.SKIN_TOKEN_KIND();
    this.nonFungibleTokenTransferTestCase(tokenId, tokenKind);
  });
});
