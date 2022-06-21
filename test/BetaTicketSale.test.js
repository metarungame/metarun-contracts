const { expect } = require("chai");
const { ethers } = require("hardhat");

const TOKEN_URI = "localhost:8000/{id}.json";

describe("BetaTicketSale", function () {
  before(async function () {
    this.betaTicketSaleFactory = await ethers.getContractFactory("BetaTicketSale");
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.buyer = this.signers[1];
    this.firstVIPUser = this.signers[2];
    this.secondVIPUser = this.signers[3];
  });

  beforeEach(async function () {
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [TOKEN_URI]);
    this.betaTicketSale = await upgrades.deployProxy(this.betaTicketSaleFactory, [this.metarunCollection.address]);
    this.bronzeTicketKind = await this.metarunCollection.BRONZE_TICKET_KIND();
    this.silverTicketKind = await this.metarunCollection.SILVER_TICKET_KIND();
    this.goldTicketKind = await this.metarunCollection.GOLD_TICKET_KIND();
  });

  describe("Buy", function () {
    it("should buy single-minted ticket", async function () {
      const tokenId = this.bronzeTicketKind << 16;
      await this.metarunCollection.mint(this.betaTicketSale.address, tokenId, 1);
      await this.betaTicketSale.connect(this.buyer).buy(this.bronzeTicketKind, {
        value: "100000000000",
      });
      const balanceAfter = await this.metarunCollection.balanceOf(this.buyer.address, tokenId);
      expect(balanceAfter).to.be.eq(1);
      const boughtTicketId = await this.betaTicketSale.getBoughtTicketId(this.buyer.address);
      expect(boughtTicketId).to.be.eq(tokenId);
    });

    it("vip user should buy single-minted ticket", async function () {
      const tokenId = this.bronzeTicketKind << 16;
      await this.metarunCollection.mint(this.betaTicketSale.address, tokenId, 1);
      await this.betaTicketSale.addVip(this.firstVIPUser.address);
      const balanceBefore = await this.metarunCollection.balanceOf(this.firstVIPUser.address, tokenId);
      expect(balanceBefore).to.be.eq(0);
      await this.betaTicketSale.connect(this.firstVIPUser).buy(this.bronzeTicketKind, {
        value: "100000000000",
      });
      const balanceAfter = await this.metarunCollection.balanceOf(this.firstVIPUser.address, tokenId);
      expect(balanceAfter).to.be.eq(1);
      const boughtTicketId = await this.betaTicketSale.getBoughtTicketId(this.firstVIPUser.address);
      expect(boughtTicketId).to.be.eq(tokenId);
    });

    it("should buy batch-minted ticket", async function () {
      // when pop from array of tickets, we expect the last minted ticket to be sold
      // that is why token id we define as 0x04000009
      const tokenId = (this.bronzeTicketKind << 16) + 9;
      await this.metarunCollection.mintBatch(this.betaTicketSale.address, this.bronzeTicketKind, 10);
      await this.betaTicketSale.connect(this.buyer).buy(this.bronzeTicketKind, {
        value: "100000000000",
      });
      const balanceAfter = await this.metarunCollection.balanceOf(this.buyer.address, tokenId);
      expect(balanceAfter).to.be.eq(1);
    });

    it("should revert on second attempt to buy", async function () {
      this.skip();
      const tokenToBuy = this.silverTicketKind << 16;
      await this.metarunCollection.mint(this.betaTicketSale.address, tokenToBuy, 1);
      await this.betaTicketSale.connect(this.buyer).buy(this.silverTicketKind, {
        value: ethers.utils.parseUnits("200", "gwei"),
      });
      const tokenReverted = this.bronzeTicketKind << 16;
      await this.metarunCollection.mint(this.betaTicketSale.address, tokenReverted, 1);
      const buyAttempt = this.betaTicketSale.connect(this.buyer).buy(this.bronzeTicketKind, {
        value: ethers.utils.parseUnits("100", "gwei"),
      });
      await expect(buyAttempt).to.be.revertedWith("Buyer should not buy a ticket before");
    });

    it("should revert if single-minted kind is invalid", async function () {
      const invalidKind = await this.metarunCollection.ARTIFACT_TOKEN_KIND();
      const tokenToBuy = invalidKind << 16;
      const attemptToMint = this.metarunCollection.mint(this.betaTicketSale.address, tokenToBuy, 1);
      await expect(attemptToMint).to.be.revertedWith("ERC1155: ERC1155Receiver rejected tokens");
    });

    it("should revert if batch-minted kind is invalid", async function () {
      const invalidKind = await this.metarunCollection.ARTIFACT_TOKEN_KIND();
      const attemptToMint = this.metarunCollection.mintBatch(this.betaTicketSale.address, invalidKind, 10);
      await expect(attemptToMint).to.be.revertedWith("ERC1155: ERC1155Receiver rejected tokens");
    });

    it("should revert if kind being bought is invalid", async function () {
      const invalidKind = await this.metarunCollection.ARTIFACT_TOKEN_KIND();
      const attemptToBuy = this.betaTicketSale.connect(this.buyer).buy(invalidKind, {
        value: ethers.utils.parseUnits("100", "gwei"),
      });
      await expect(attemptToBuy).to.be.revertedWith("Provided kind should be ticket");
    });

    it("should revert if msg.value is low", async function () {
      await this.metarunCollection.mintBatch(this.betaTicketSale.address, this.goldTicketKind, 10);
      const attempt = this.betaTicketSale.connect(this.buyer).buy(this.goldTicketKind, {
        value: ethers.utils.parseUnits("100", "gwei"),
      });
      await expect(attempt).to.be.revertedWith("Buyer should provide exactly the price of ticket");
    });

    it("should revert if msg.value is high", async function () {
      await this.metarunCollection.mintBatch(this.betaTicketSale.address, this.goldTicketKind, 10);
      const attempt = this.betaTicketSale.connect(this.buyer).buy(this.goldTicketKind, {
        value: ethers.utils.parseUnits("100000", "gwei"),
      });
      await expect(attempt).to.be.revertedWith("Buyer should provide exactly the price of ticket");
    });

    it("should revert if not enough tickets for the common user on contract ", async function () {
      await this.metarunCollection.mintBatch(this.betaTicketSale.address, this.goldTicketKind, 1);
      await this.betaTicketSale.addVip(this.firstVIPUser.address);
      const attempt = this.betaTicketSale.connect(this.buyer).buy(this.goldTicketKind, {
        value: "300000000000",
      });
      await expect(attempt).to.be.revertedWith("Not enough tickets on contract balance");
    });
  });

  describe("Getters", function () {
    it("should properly give bought ticket", async function () {
      await this.metarunCollection.mintBatch(this.betaTicketSale.address, this.bronzeTicketKind, 100);
      await this.betaTicketSale.connect(this.buyer).buy(this.bronzeTicketKind, {
        value: ethers.utils.parseUnits("100", "gwei"),
      });
      const boughtTicket = await this.betaTicketSale.getBoughtTicketId(this.buyer.address);
      expect(boughtTicket).to.be.eq((this.bronzeTicketKind << 16) + 99);
    });

    it("should properly give ticket price", async function () {
      const ticketPrice = await this.betaTicketSale.getTicketKindPrice(this.bronzeTicketKind);
      expect(ticketPrice).to.be.eq(ethers.utils.parseUnits("100", "gwei"));
    });

    it("should properly give tickets left amount", async function () {
      await this.metarunCollection.mintBatch(this.betaTicketSale.address, this.bronzeTicketKind, 100);
      await this.betaTicketSale.connect(this.buyer).buy(this.bronzeTicketKind, {
        value: ethers.utils.parseUnits("100", "gwei"),
      });
      const tokensLeft = await this.betaTicketSale.getTicketsLeftByKind(this.bronzeTicketKind, this.buyer.address);
      expect(tokensLeft).to.be.eq(99);
    });

    it("should properly give tickets left amount for common user when the list of VIP users is not empty", async function () {
      await this.metarunCollection.mintBatch(this.betaTicketSale.address, this.bronzeTicketKind, 100);
      const tokensLeftBefore = await this.betaTicketSale.connect(this.buyer).getTicketsLeftByKind(this.bronzeTicketKind, this.buyer.address);
      expect(tokensLeftBefore).to.be.eq(100);
      await this.betaTicketSale.addVip(this.firstVIPUser.address);
      await this.betaTicketSale.addVip(this.secondVIPUser.address);
      const tokensLeftAfter = await this.betaTicketSale.connect(this.buyer).getTicketsLeftByKind(this.bronzeTicketKind, this.buyer.address);
      expect(tokensLeftAfter).to.be.eq(98);
      await this.betaTicketSale.connect(this.firstVIPUser).buy(this.bronzeTicketKind, {
        value: ethers.utils.parseUnits("100", "gwei"),
      });
      const tokensLeft = await this.betaTicketSale.connect(this.buyer).getTicketsLeftByKind(this.bronzeTicketKind, this.buyer.address);
      expect(tokensLeft).to.be.eq(98);
    });

    it("should properly give tickets left amount for VIP user", async function () {
      await this.metarunCollection.mintBatch(this.betaTicketSale.address, this.bronzeTicketKind, 100);
      const tokensLeftBefore = await this.betaTicketSale
        .connect(this.firstVIPUser)
        .getTicketsLeftByKind(this.bronzeTicketKind, this.firstVIPUser.address);
      expect(tokensLeftBefore).to.be.eq(100);
      await this.betaTicketSale.addVip(this.firstVIPUser.address);
      await this.betaTicketSale.addVip(this.secondVIPUser.address);
      await this.betaTicketSale.connect(this.firstVIPUser).buy(this.bronzeTicketKind, {
        value: ethers.utils.parseUnits("100", "gwei"),
      });
      const tokensLeft = await this.betaTicketSale
        .connect(this.secondVIPUser)
        .getTicketsLeftByKind(this.bronzeTicketKind, this.secondVIPUser.address);
      expect(tokensLeft).to.be.eq(99);
    });
  });

  describe("Receive hooks", function () {
    it("should deny attempt call hook onERC1155Received", async function () {
      const operator = this.metarunCollection.address;
      const from = this.deployer.address;
      const id = (this.bronzeTicketKind << 16) + 1;
      const value = 1;
      const attempt = this.betaTicketSale.onERC1155Received(operator, from, id, value);
      await expect(attempt).to.be.reverted;
    });

    it("should deny attempt call hook onERC1155BatchReceived", async function () {
      const operator = this.metarunCollection.address;
      const from = this.deployer.address;
      const ids = [this.bronzeTicketKind << 16, this.silverTicketKind << 16, this.goldTicketKind << 16];
      const values = [1, 1, 1];
      const attempt = this.betaTicketSale.onERC1155Received(operator, from, ids, values);
      await expect(attempt).to.be.reverted;
    });
  });

  describe("Add vip user", function () {
    it("should return when trying to add vip user again", async function () {
      await this.betaTicketSale.addVip(this.firstVIPUser.address);
      await this.betaTicketSale.addVip(this.secondVIPUser.address);
      attempt = this.betaTicketSale.addVip(this.secondVIPUser.address);
      await expect(attempt).to.be.revertedWith("Address already exists in the VIP list");
    });
    it("should return when trying to add vip user without SETTER_ROLE role", async function () {
      await this.betaTicketSale.addVip(this.firstVIPUser.address);
      attempt = this.betaTicketSale.connect(this.buyer).addVip(this.secondVIPUser.address);
      await expect(attempt).to.be.revertedWith("You should have SETTER_ROLE");
    });
  });
});
