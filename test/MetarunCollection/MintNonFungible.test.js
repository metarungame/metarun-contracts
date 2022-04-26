const { expect } = require("chai");
const { ethers } = require("hardhat");
const URI_TOKEN = "localhost/api/{id}.json";

describe("MetarunCollection | Non-fungible token mint", function () {
  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
    await this.metarunCollection.deployed();
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.stranger = this.signers[1];
    this.recipient = this.signers[2];

    this.nonFungibleTokenMintTestCase = async (tokenId, tokenKind) => {
      const isKindCheck = await this.metarunCollection.isKind(tokenId, tokenKind);
      const fungibleKind = await this.metarunCollection.FUNGIBLE_TOKEN_KIND();
      const isFungibleCheck = await this.metarunCollection.isKind(tokenId, fungibleKind);
      expect(isKindCheck).to.be.eq(true);
      expect(isFungibleCheck).to.be.eq(false);

      await this.metarunCollection.connect(this.deployer).mint(this.stranger.address, tokenId, 1);
      const balance = await this.metarunCollection.balanceOf(this.stranger.address, tokenId);
      expect(balance).to.be.eq(1);
    };
  });

  function getTokenId() {
    return Math.floor((Math.random() * 100000) % 2 ** 16);
  }

  it("should mint character craftsman token", async function () {
    const tokenId = (0x0000 << 16) | getTokenId();
    const tokenKind = await this.metarunCollection.CRAFTSMAN_CHARACTER_KIND();
    this.nonFungibleTokenMintTestCase(tokenId, tokenKind);
  });

  it("should mint character fighter token", async function () {
    const tokenId = (0x0001 << 16) | getTokenId();
    const tokenKind = await this.metarunCollection.FIGHTER_CHARACTER_KIND();
    this.nonFungibleTokenMintTestCase(tokenId, tokenKind);
  });

  it("should mint character sprinter token", async function () {
    const tokenId = (0x0002 << 16) | getTokenId();
    const tokenKind = await this.metarunCollection.SPRINTER_CHARACTER_KIND();
    this.nonFungibleTokenMintTestCase(tokenId, tokenKind);
  });

  it("should mint artifact token", async function () {
    const tokenId = (0x0100 << 16) | getTokenId();
    const tokenKind = await this.metarunCollection.ARTIFACT_TOKEN_KIND();
    this.nonFungibleTokenMintTestCase(tokenId, tokenKind);
  });

  it("should mint pet token", async function () {
    const tokenId = (0x0200 << 16) | getTokenId();
    const tokenKind = await this.metarunCollection.PET_TOKEN_KIND();
    this.nonFungibleTokenMintTestCase(tokenId, tokenKind);
  });

  it("should mint skin token", async function () {
    const tokenId = (0x0300 << 16) | getTokenId();
    const tokenKind = await this.metarunCollection.SKIN_TOKEN_KIND();
    this.nonFungibleTokenMintTestCase(tokenId, tokenKind);
  });

  it("should deny minting more than 1 character craftsman token", async function () {
    const tokenId = (0x0000 << 16) | getTokenId();
    const attemptToMint = this.metarunCollection.connect(this.deployer).mint(this.stranger.address, tokenId, 100);
    await expect(attemptToMint).to.be.revertedWith("Cannot mint more than one item");
  });

  it("should deny minting more than 1 character fighter token", async function () {
    const tokenId = (0x0001 << 16) | getTokenId();
    const attemptToMint = this.metarunCollection.connect(this.deployer).mint(this.stranger.address, tokenId, 100);
    await expect(attemptToMint).to.be.revertedWith("Cannot mint more than one item");
  });

  it("should deny minting more than 1 character sprinter token", async function () {
    const tokenId = (0x0002 << 16) | getTokenId();
    const attemptToMint = this.metarunCollection.connect(this.deployer).mint(this.stranger.address, tokenId, 100);
    await expect(attemptToMint).to.be.revertedWith("Cannot mint more than one item");
  });

  it("should deny minting more than 1 artifact token", async function () {
    const tokenId = (0x0100 << 16) | getTokenId();
    const attemptToMint = this.metarunCollection.connect(this.deployer).mint(this.stranger.address, tokenId, 100);
    await expect(attemptToMint).to.be.revertedWith("Cannot mint more than one item");
  });

  it("should deny minting more than 1 pet token", async function () {
    const tokenId = (0x0200 << 16) | getTokenId();
    const attemptToMint = this.metarunCollection.connect(this.deployer).mint(this.stranger.address, tokenId, 100);
    await expect(attemptToMint).to.be.revertedWith("Cannot mint more than one item");
  });

  it("should deny minting more than 1 skin token", async function () {
    const tokenId = (0x0300 << 16) | getTokenId();
    const attemptToMint = this.metarunCollection.connect(this.deployer).mint(this.stranger.address, tokenId, 100);
    await expect(attemptToMint).to.be.revertedWith("Cannot mint more than one item");
  });
});
