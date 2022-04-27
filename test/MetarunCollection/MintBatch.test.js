const { expect } = require("chai");
const { ethers } = require("hardhat");
const URI_TOKEN = "localhost:8000/api/{id}.json";

describe("MetarunCollection | mintBatch() function", function () {
  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
  });
  describe("Mint scenarios", function () {
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

    it("should properly mint two different kinds", async function () {
      const skinKind = await this.metarunCollection.SKIN_TOKEN_KIND();
      const characterKind = await this.metarunCollection.CRAFTSMAN_CHARACTER_KIND();
      const amount = 20;
      let skinIds = [];
      for (let i = 0; i < amount; i++) {
        skinIds[i] = (skinKind << 16) | i;
      }
      let characterIds = [];
      for (let i = 0; i < amount; i++) {
        characterIds[i] = (characterKind << 16) | i;
      }
      await this.metarunCollection.mintBatch(this.recipient.address, skinKind, amount);
      await this.metarunCollection.mintBatch(this.recipient.address, characterKind, amount);
      for (let i = 0; i < amount; i++) {
        const balanceSkin = await this.metarunCollection.balanceOf(this.recipient.address, skinIds[i]);
        expect(balanceSkin).to.be.eq(1);
        const balanceCharacter = await this.metarunCollection.balanceOf(this.recipient.address, characterIds[i]);
        expect(balanceCharacter).to.be.eq(1);
      }
    });
  });

  describe("Revert conditions", function () {
    beforeEach(async function () {
      this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
      await this.metarunCollection.deployed();
      this.signers = await ethers.getSigners();
      this.deployer = this.signers[0];
      this.stranger = this.signers[1];
      this.recipient = this.signers[2];
    });
    it("should revert on lack of MINTER_ROLE", async function () {
      const skinKind = await this.metarunCollection.SKIN_TOKEN_KIND();
      const attemptToMintBatch = this.metarunCollection.connect(this.recipient).mintBatch(this.recipient.address, skinKind, 10);
      await expect(attemptToMintBatch).to.be.revertedWith("METARUNCOLLECTION: need MINTER_ROLE");
    });

    it("should revert on attempt to mint fungible", async function () {
      const fungibleKind = await this.metarunCollection.FUNGIBLE_TOKEN_KIND();
      const attemptToMintBatch = this.metarunCollection.mintBatch(this.recipient.address, fungibleKind, 10);
      await expect(attemptToMintBatch).to.be.revertedWith("Mint many is available only for NFT");
    });

    it("should revert on attempt to mint 0 tokens", async function () {
      const skinKind = await this.metarunCollection.SKIN_TOKEN_KIND();
      const attemptToMintBatch = this.metarunCollection.mintBatch(this.recipient.address, skinKind, 0);
      await expect(attemptToMintBatch).to.be.revertedWith("Count should be greater than 0");
    });

    it("should revert on attempt to mint already existing", async function () {
      const skinKind = await this.metarunCollection.SKIN_TOKEN_KIND();
      const alreadyMintedTokenId = (skinKind << 16) | 1;
      await this.metarunCollection.mint(this.recipient.address, alreadyMintedTokenId, 1);
      const attemptToMintBatch = this.metarunCollection.mintBatch(this.recipient.address, skinKind, 2);
      await expect(attemptToMintBatch).to.be.revertedWith("Cannot mint more than one item");
    });
  });

  describe("Behavior of kindSupply", function () {
    beforeEach(async function () {
      this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
      await this.metarunCollection.deployed();
      this.signers = await ethers.getSigners();
      this.deployer = this.signers[0];
      this.stranger = this.signers[1];
      this.recipient = this.signers[2];
    });

    it("should increase after single-mint", async function () {
      const skinKind = await this.metarunCollection.SKIN_TOKEN_KIND();
      const tokenId = (skinKind << 16) | 3;
      const beforeMint = await this.metarunCollection.getKindSupply(skinKind);
      await this.metarunCollection.mint(this.recipient.address, tokenId, 1);
      const afterMint = await this.metarunCollection.getKindSupply(skinKind);
      expect(beforeMint).to.be.eq(0);
      expect(afterMint).to.be.eq(1);
    });

    it("should increase after batch-mint", async function () {
      const skinKind = await this.metarunCollection.SKIN_TOKEN_KIND();
      const beforeMint = await this.metarunCollection.getKindSupply(skinKind);
      const amount = 100;
      await this.metarunCollection.mintBatch(this.recipient.address, skinKind, amount);
      const afterMint = await this.metarunCollection.getKindSupply(skinKind);
      expect(afterMint - amount).to.be.eq(beforeMint);
    });

    it("should stay the same if single-mint failed", async function () {
      const skinKind = await this.metarunCollection.SKIN_TOKEN_KIND();
      const tokenId = (skinKind << 16) | 3;
      await this.metarunCollection.mint(this.recipient.address, tokenId, 1);

      const beforeMint = await this.metarunCollection.getKindSupply(skinKind);
      const failingAttemptToMint = this.metarunCollection.mint(this.recipient.address, tokenId, 1);
      await expect(failingAttemptToMint).to.be.revertedWith("Cannot mint more than one item");
      const afterMint = await this.metarunCollection.getKindSupply(skinKind);
      expect(beforeMint).to.be.eq(afterMint);
    });

    it("should stay the same if batch-mint failed", async function () {
      const artifactKind = await this.metarunCollection.ARTIFACT_TOKEN_KIND();
      const tokenId = (artifactKind << 16) | 3;
      await this.metarunCollection.mint(this.recipient.address, tokenId, 1);

      const beforeMint = await this.metarunCollection.getKindSupply(artifactKind);
      const failingAttemptToMint = this.metarunCollection.mintBatch(this.recipient.address, artifactKind, 100);
      await expect(failingAttemptToMint).to.be.revertedWith("Cannot mint more than one item");
      const afterMint = await this.metarunCollection.getKindSupply(artifactKind);
      expect(beforeMint).to.be.eq(afterMint);
    });
  });
});
