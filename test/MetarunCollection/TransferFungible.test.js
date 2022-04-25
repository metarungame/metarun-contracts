const { expect } = require("chai");
const { ethers } = require("hardhat");
const URI_TOKEN = "localhost/api/{id}.json";

describe("MetarunCollection | Fungible token transfer", async function () {
  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
    await this.metarunCollection.deployed();
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.stranger = this.signers[1];
    this.recipient = this.signers[2];
    this.fungibleToken = await this.metarunCollection.FUNGIBLE_TOKEN_KIND();

    this.fungibleTokenTransferTestCase = async (fungibleTokenId) => {
      const amount = 100;
      await this.metarunCollection.connect(this.deployer).mint(this.stranger.address, fungibleTokenId, amount);
      await this.metarunCollection
        .connect(this.stranger)
        .safeTransferFrom(this.stranger.address, this.recipient.address, fungibleTokenId, amount, []);
      const recipientBalanceAfterTx = await this.metarunCollection.balanceOf(this.recipient.address, fungibleTokenId);
      const senderBalanceAfterTx = await this.metarunCollection.balanceOf(this.stranger.address, fungibleTokenId);
      expect(recipientBalanceAfterTx).to.be.eq(amount);
      expect(senderBalanceAfterTx).to.be.eq(0);
    };
  });

  it("should transfer health token", async function () {
    const token = await this.metarunCollection.HEALTH_TOKEN_ID();
    await this.fungibleTokenTransferTestCase(token);
  });

  it("should transfer mana token", async function () {
    const token = await this.metarunCollection.MANA_TOKEN_ID();
    await this.fungibleTokenTransferTestCase(token);
  });

  it("should transfer speed token", async function () {
    const token = await this.metarunCollection.SPEED_TOKEN_ID();
    await this.fungibleTokenTransferTestCase(token);
  });

  it("should transfer collision damage token", async function () {
    const token = await this.metarunCollection.COLLISION_DAMAGE_TOKEN_ID();
    await this.fungibleTokenTransferTestCase(token);
  });
});
