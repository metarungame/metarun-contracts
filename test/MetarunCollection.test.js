const { expect } = require("chai");
const { ethers } = require("hardhat");

const URI_TOKEN = "https://app-staging.metarun.game/metadata/{id}.json";

describe("Metarun token collection", function () {
  it("is deployed", async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.metarunCollection = await this.metarunCollectionFactory.deploy(URI_TOKEN);
    await this.metarunCollection.deployed();
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.stranger = this.signers[1];
    this.recepient = this.signers[2];
    this.characterToken = await this.metarunCollection.CHARACTER();
    this.petToken = await this.metarunCollection.PET();
    this.artifactToken = await this.metarunCollection.ARTIFACT();
    this.skinToken = await this.metarunCollection.SKIN();
  });

  describe("Token creation", function () {
    async function testTokenCreation(collectionToken, address, tokenId, expectedAmount) {
      const balanceOfFirstToken = await collectionToken.balanceOf(address, tokenId);
      expect(balanceOfFirstToken).to.be.eq(expectedAmount);
    }

    async function mintToken(collectionToken, minter, receiver, tokenId, amount) {
      await collectionToken.connect(minter).mint(receiver, tokenId, amount);
    }

    it("should create character token", async function () {
      await mintToken(this.metarunCollection, this.deployer, this.stranger.address, this.characterToken, 1);
      await testTokenCreation(this.metarunCollection, this.stranger.address, this.characterToken, "1");
    });

    it("should create pet token", async function () {
      await mintToken(this.metarunCollection, this.deployer, this.stranger.address, this.petToken, 1);
      await testTokenCreation(this.metarunCollection, this.stranger.address, this.petToken, "1");
    });

    it("should create artifact token", async function () {
      await mintToken(this.metarunCollection, this.deployer, this.stranger.address, this.artifactToken, 1);
      await testTokenCreation(this.metarunCollection, this.stranger.address, this.artifactToken, "1");
    });

    it("should create skin token", async function () {
      await mintToken(this.metarunCollection, this.deployer, this.stranger.address, this.skinToken, 1);
      await testTokenCreation(this.metarunCollection, this.stranger.address, this.skinToken, "1");
    });

    it("should give zero if token does not exist", async function () {
      const dummyBalance = await this.metarunCollection.balanceOf(this.deployer.address, 9999);
      expect(dummyBalance).to.be.eq(0);
    });
  });

  describe("Token transfer", async function () {
    before(async function () {
      this.senderAddress = this.stranger.address;
      this.recepientAddress = this.recepient.address;
    });

    async function checkBalancesAfterTx(collectionToken, tokenId, senderAddress, recepientAddress) {
      const recipientBalanceAfterTx = await collectionToken.balanceOf(recepientAddress, tokenId);
      const senderBalanceAfterTx = await collectionToken.balanceOf(senderAddress, tokenId);
      expect(recipientBalanceAfterTx).to.be.eq(1);
      expect(senderBalanceAfterTx).to.be.eq(0);
    }

    it("should transfer character token", async function () {
      await this.metarunCollection
        .connect(this.stranger)
        .safeTransferFrom(this.senderAddress, this.recepientAddress, this.characterToken, 1, []);
      checkBalancesAfterTx(this.metarunCollection, this.characterToken, this.senderAddress, this.recepientAddress);
    });

    it("should transfer pet token", async function () {
      await this.metarunCollection.connect(this.stranger).safeTransferFrom(this.senderAddress, this.recepientAddress, this.petToken, 1, []);
      checkBalancesAfterTx(this.metarunCollection, this.petToken, this.senderAddress, this.recepientAddress);
    });

    it("should transfer artifact token", async function () {
      await this.metarunCollection.connect(this.stranger).safeTransferFrom(this.senderAddress, this.recepientAddress, this.artifactToken, 1, []);
      checkBalancesAfterTx(this.metarunCollection, this.artifactToken, this.senderAddress, this.recepientAddress);
    });

    it("should transfer skin token", async function () {
      await this.metarunCollection.connect(this.stranger).safeTransferFrom(this.senderAddress, this.recepientAddress, this.skinToken, 1, []);
      checkBalancesAfterTx(this.metarunCollection, this.skinToken, this.senderAddress, this.recepientAddress);
    });

    it("should revert transfer of non-existing token", async function () {
      const nonExistingToken = 99999;
      const badTransfer = this.metarunCollection
        .connect(this.stranger)
        .safeTransferFrom(this.senderAddress, this.recepientAddress, nonExistingToken, 1, []);
      await expect(badTransfer).to.be.reverted;
    });
  });

  describe("Token uri", function () {
    async function testUriGiving(collectionToken, tokenId) {
      const uri = await collectionToken.uri(tokenId);
      expect(uri).to.be.eq(URI_TOKEN);
    }

    it("should correctly give uri for tokens", async function () {
      testUriGiving(this.metarunCollection, this.characterToken);
      testUriGiving(this.metarunCollection, this.petToken);
      testUriGiving(this.metarunCollection, this.artifactToken);
      testUriGiving(this.metarunCollection, this.skinToken);
    });
  });

  describe("Token roles", function () {
    it("should deny minting for non-minter", async function () {
      const attemptToMint = this.metarunCollection.connect(this.stranger).mint(this.stranger.address, this.characterToken, 10);
      await expect(attemptToMint).to.be.revertedWith("METARUNCOLLECTION: need MINTER_ROLE");
    });

    it("should perform minting for minter", async function () {
      const attemptToMint = this.metarunCollection.mint(this.stranger.address, this.characterToken, 10);
      await expect(attemptToMint).to.be.ok;
    });

    it("should deny changing uri for non-admin", async function () {
      const attemptTosetURI = this.metarunCollection.connect(this.stranger).setURI("localhost:5050/api/tokens/{id}.json");
      await expect(attemptTosetURI).to.be.revertedWith("METARUNCOLLECTION: need DEFAULT_ADMIN_ROLE");
    });

    it("should perform changing uri for admin", async function () {
      const attemptTosetURI = this.metarunCollection.setURI("localhost:5050/api/tokens/{id}.json");
      await expect(attemptTosetURI).to.be.ok;
    });
  });
});
