const { expect } = require("chai");
const { ethers } = require("hardhat");
const URI_TOKEN = "localhost/api/{id}.json";

describe("MetarunCollection | Fungible token mint", function () {
  this.beforeAll(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
    await this.metarunCollection.deployed();
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.stranger = this.signers[1];
    this.recipient = this.signers[2];
    this.fungibleToken = await this.metarunCollection.FUNGIBLE_TOKEN_KIND();

    this.fungibleTokenMintTestCase = async (tokenId) => {
      const amount = 100;
      await this.metarunCollection.connect(this.deployer).mint(this.recipient.address, tokenId, amount);
      const balanceOfToken = await this.metarunCollection.balanceOf(this.recipient.address, tokenId);
      expect(balanceOfToken).to.be.eq(amount);
    };
  });

  it("should mint successfully health token", async function () {
    const token = await this.metarunCollection.HEALTH_TOKEN_ID();
    this.fungibleTokenMintTestCase(token);
  });

  it("should mint successfully mana token", async function () {
    const token = await this.metarunCollection.MANA_TOKEN_ID();
    this.fungibleTokenMintTestCase(token);
  });

  it("should mint successfully speed token", async function () {
    const token = await this.metarunCollection.SPEED_TOKEN_ID();
    this.fungibleTokenMintTestCase(token);
  });

  it("should mint successfully collision damage token", async function () {
    const token = await this.metarunCollection.COLLISION_DAMAGE_TOKEN_ID();
    this.fungibleTokenMintTestCase(token);
  });
});
