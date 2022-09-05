const { expect } = require("chai");
const { ethers } = require("hardhat");
const URI_TOKEN = "localhost:8000/api/{id}.json";

describe("MetarunCollection | mintBatch() function", function () {
  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.metarunCollectionMockFactory = await ethers.getContractFactory("MetarunCollectionMock");
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
      const ticketKind = await this.metarunCollection.BRONZE_TICKET_KIND();
      const amount = 10;
      let ticketIds = [];
      for (let i = 0; i < amount; i++) {
        ticketIds[i] = (ticketKind << 16) | i;
      }
      await this.metarunCollection.mintBatch(this.recipient.address, ticketKind, amount);
      for (let i = 0; i < amount; i++) {
        const balance = await this.metarunCollection.balanceOf(this.recipient.address, ticketIds[i]);
        expect(balance).to.be.eq(1);
      }
    });

    it("should properly mint batch after batch", async function () {
      const ticketKind = await this.metarunCollection.BRONZE_TICKET_KIND();
      const amount = 20;
      let ticketIds = [];
      for (let i = 0; i < amount; i++) {
        ticketIds[i] = (ticketKind << 16) | i;
      }
      await this.metarunCollection.mintBatch(this.recipient.address, ticketKind, amount / 2);
      await this.metarunCollection.mintBatch(this.recipient.address, ticketKind, amount / 2);
      for (let i = 0; i < amount; i++) {
        const balance = await this.metarunCollection.balanceOf(this.recipient.address, ticketIds[i]);
        expect(balance).to.be.eq(1);
      }
    });

    it("should properly mint in batch-single-batch mint schema", async function () {
      const ticketKind = await this.metarunCollection.BRONZE_TICKET_KIND();
      const amount = 21;
      let ticketIds = [];
      for (let i = 0; i < amount; i++) {
        if (i == 10) continue;
        ticketIds[i] = (ticketKind << 16) | i;
      }
      const tokenIdOfSingle = (ticketKind << 16) | 10;

      await this.metarunCollection.mintBatch(this.recipient.address, ticketKind, Math.floor(amount / 2));
      await this.metarunCollection.mint(this.recipient.address, tokenIdOfSingle, 1);
      await this.metarunCollection.mintBatch(this.recipient.address, ticketKind, Math.floor(amount / 2));

      for (let i = 0; i < amount; i++) {
        if (i == 10) continue;
        const balance = await this.metarunCollection.balanceOf(this.recipient.address, ticketIds[i]);
        const tokenSupply = await this.metarunCollection.totalSupply(ticketIds[i]);
        expect(balance).to.be.eq(1);
        expect(tokenSupply).to.be.eq(1);
      }
      const balanceOfSingle = await this.metarunCollection.balanceOf(this.recipient.address, tokenIdOfSingle);
      const tokenSupplyOfSingle = await this.metarunCollection.totalSupply(tokenIdOfSingle);
      expect(balanceOfSingle).to.be.eq(1);
      expect(tokenSupplyOfSingle).to.be.eq(1);
    });

    it("should properly mint two different kinds", async function () {
      const ticketKind = await this.metarunCollection.BRONZE_TICKET_KIND();
      const petKind = await this.metarunCollection.PET_TOKEN_KIND();
      const amount = 20;
      let ticketIds = [];
      for (let i = 0; i < amount; i++) {
        ticketIds[i] = (ticketKind << 16) | i;
      }
      let petIds = [];
      for (let i = 0; i < amount; i++) {
        petIds[i] = (petKind << 16) | i;
      }
      await this.metarunCollection.mintBatch(this.recipient.address, ticketKind, amount);
      await this.metarunCollection.mintBatch(this.recipient.address, petKind, amount);
      for (let i = 0; i < amount; i++) {
        const balanceTicket = await this.metarunCollection.balanceOf(this.recipient.address, ticketIds[i]);
        expect(balanceTicket).to.be.eq(1);
        const balancePet = await this.metarunCollection.balanceOf(this.recipient.address, petIds[i]);
        expect(balancePet).to.be.eq(1);
      }
    });

    it("should properly mint with pre-seeded random single tokens", async function () {
      /*
                In this test firstly we generate a bit of pre-seed token ids.
                Mint batch should "avoid" them but anyway generate desired count of tokens.

                Here is example. Assume we already have minted in single-mint way 5 tokens with following ids:
                0 2 5 7 8
                Then we call mintBatch() to mint additional 10 tokens. mintBatch() should
                1) fill "empty" places (i.e. here these empty places are token ids 1 3 6)
                2) continue minting further with token ids 9 10 11 12 13 14 15
                Result: tokens from [0; 15) are minted
            */
      const ticketKind = await this.metarunCollection.BRONZE_TICKET_KIND();
      const preSeedTokenIds = new Set();
      const preSeedTokenIdMaxValue = 10;
      const preSeedTokenIdsSize = 5;
      while (preSeedTokenIds.size < preSeedTokenIdsSize) {
        const number = Math.floor(Math.random() * 100);
        const numberInDesiredLimits = number % preSeedTokenIdMaxValue;
        const tokenId = (ticketKind << 16) | numberInDesiredLimits;
        preSeedTokenIds.add(tokenId);
      }
      preSeedTokenIds.forEach(async (tokenId) => await this.metarunCollection.mint(this.recipient.address, tokenId, 1));

      const batchSize = 10;
      await this.metarunCollection.mintBatch(this.recipient.address, ticketKind, batchSize);
      const totalSize = preSeedTokenIdsSize + batchSize;
      for (let i = 0; i < totalSize; i++) {
        const tokenId = (ticketKind << 16) | i;
        const exists = await this.metarunCollection.exists(tokenId);
        expect(exists).to.be.true;
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
      const characterKind = await this.metarunCollection.IGNIS_CLASSIC_COMMON();
      const attemptToMintBatch = this.metarunCollection.connect(this.recipient).mintBatch(this.recipient.address, characterKind, 10);
      await expect(attemptToMintBatch).to.be.revertedWith("NEED_MINTER_ROLE");
    });

    it("should revert on attempt to mint fungible", async function () {
      const fungibleKind = await this.metarunCollection.FUNGIBLE_TOKEN_KIND();
      const attemptToMintBatch = this.metarunCollection.mintBatch(this.recipient.address, fungibleKind, 10);
      await expect(attemptToMintBatch).to.be.revertedWith("UNSUITABLE_KIND");
    });

    it("should revert on attempt to mint 0 tokens", async function () {
      const characterKind = await this.metarunCollection.PENNA_CLASSIC_COMMON();
      const attemptToMintBatch = this.metarunCollection.mintBatch(this.recipient.address, characterKind, 0);
      await expect(attemptToMintBatch).to.be.revertedWith("COUNT_UNDERFLOW");
    });

    it("should revert on overflow of ids", async function () {
      const metarunCollectionMock = await upgrades.deployProxy(this.metarunCollectionMockFactory, [URI_TOKEN]);
      await metarunCollectionMock.deployed();
      const characterKind = await metarunCollectionMock.ORO_CLASSIC_COMMON();
      const attemptToMintWithOverflow = metarunCollectionMock.mintBatch(this.recipient.address, characterKind, 10);
      await expect(attemptToMintWithOverflow).to.be.revertedWith("KIND_OVERFLOW");
    });
  });

  describe("Getting kindSupply() scenarios", function () {
    beforeEach(async function () {
      this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
      await this.metarunCollection.deployed();
      this.signers = await ethers.getSigners();
      this.deployer = this.signers[0];
      this.stranger = this.signers[1];
      this.recipient = this.signers[2];
    });

    it("should increase after single-mint nft", async function () {
      const skinKind = await this.metarunCollection.BRONZE_TICKET_KIND();
      const tokenId = (skinKind << 16) | 3;
      const beforeMint = await this.metarunCollection.getNFTKindSupply(skinKind);
      await this.metarunCollection.mint(this.recipient.address, tokenId, 1);
      const afterMint = await this.metarunCollection.getNFTKindSupply(skinKind);
      expect(beforeMint).to.be.eq(0);
      expect(afterMint).to.be.eq(1);
    });

    it("should increase after batch-mint", async function () {
      const skinKind = await this.metarunCollection.BRONZE_TICKET_KIND();
      const beforeMint = await this.metarunCollection.getNFTKindSupply(skinKind);
      const amount = 100;
      await this.metarunCollection.mintBatch(this.recipient.address, skinKind, amount);
      const afterMint = await this.metarunCollection.getNFTKindSupply(skinKind);
      expect(afterMint - amount).to.be.eq(beforeMint);
    });

    it("should stay the same if single-mint failed", async function () {
      const skinKind = await this.metarunCollection.BRONZE_TICKET_KIND();
      const tokenId = (skinKind << 16) | 3;
      await this.metarunCollection.mint(this.recipient.address, tokenId, 1);

      const beforeMint = await this.metarunCollection.getNFTKindSupply(skinKind);
      const failingAttemptToMint = this.metarunCollection.mint(this.recipient.address, tokenId, 1);
      await expect(failingAttemptToMint).to.be.revertedWith("Cannot mint more than one item");
      const afterMint = await this.metarunCollection.getNFTKindSupply(skinKind);
      expect(beforeMint).to.be.eq(afterMint);
    });

    it("should stay the same if batch-mint failed", async function () {
      const artifactKind = await this.metarunCollection.ARTIFACT_TOKEN_KIND();
      const tokenId = (artifactKind << 16) | 3;
      await this.metarunCollection.mint(this.recipient.address, tokenId, 1);

      const beforeMint = await this.metarunCollection.getNFTKindSupply(artifactKind);
      const failingAttemptToMint = this.metarunCollection.mintBatch(this.recipient.address, artifactKind, 2 ** 16);
      await expect(failingAttemptToMint).to.be.reverted;
      const afterMint = await this.metarunCollection.getNFTKindSupply(artifactKind);
      expect(beforeMint).to.be.eq(afterMint);
    });

    it("should stay the same after single-mint fungible token", async function () {
      const fungibleKind = await this.metarunCollection.FUNGIBLE_TOKEN_KIND();
      const healthId = (fungibleKind << 16) + 0x0000;
      const beforeMint = await this.metarunCollection.getNFTKindSupply(fungibleKind);
      await this.metarunCollection.mint(this.recipient.address, healthId, 1);
      const afterMint = await this.metarunCollection.getNFTKindSupply(fungibleKind);
      expect(beforeMint).to.be.eq(0);
      expect(afterMint).to.be.eq(0);
    });
  });
});
