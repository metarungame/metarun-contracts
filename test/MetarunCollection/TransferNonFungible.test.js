const { expect } = require("chai");
const { ethers } = require("hardhat");
const URI_TOKEN = "localhost/api/{id}.json";

describe("MetarunCollection | Non-fungible token transfer", async function () {
  function getTokenId() {
    return Math.floor((Math.random() * 100000) % 2 ** 16);
  }

  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
    await this.metarunCollection.deployed();
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.stranger = this.signers[1];
    this.recipient = this.signers[2];

    this.nonFungibleTokenTransferTestCase = async (tokenId, tokenKind) => {
      const isKindCheck = await this.metarunCollection.isKind(tokenId, tokenKind);
      const fungibleKind = await this.metarunCollection.FUNGIBLE_TOKEN_KIND();
      const isFungibleCheck = await this.metarunCollection.isKind(tokenId, fungibleKind);
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

  it("should transfer character Ignis token", async function () {
    const tokenId = 0x000106000003;
    const tokenKind = await this.metarunCollection.IGNIS_CLASSIC_COMMON();
    await this.nonFungibleTokenTransferTestCase(tokenId, tokenKind);
  });

  it("should transfer character Penna token", async function () {
    const tokenId = 0x000206000003;
    const tokenKind = await this.metarunCollection.PENNA_CLASSIC_COMMON();
    await this.nonFungibleTokenTransferTestCase(tokenId, tokenKind);
  });

  it("should transfer character Oro token", async function () {
    const tokenId = 0x000306000003;
    const tokenKind = await this.metarunCollection.ORO_CLASSIC_COMMON();
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

  it("should deny transfer more than 1 token", async function () {
    const tokenId = (0x0000 << 16) | getTokenId();
    await this.metarunCollection.connect(this.deployer).mint(this.stranger.address, tokenId, 1);
    const attemptToTransfer = this.metarunCollection
      .connect(this.stranger)
      .safeTransferFrom(this.stranger.address, this.recipient.address, tokenId, 100, []);
    await expect(attemptToTransfer).to.be.revertedWith("ERC1155: insufficient balance for transfer");
  });
});
