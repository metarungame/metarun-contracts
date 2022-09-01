const { expect } = require("chai");
const { ethers } = require("hardhat");

const TOKEN_URI = "localhost:8000/{id}.json";

describe("MysteryBoxSale", function () {
  const initialSupply = ethers.utils.parseUnits("1000000");
  before(async function () {
    this.mysteryBoxSaleFactory = await ethers.getContractFactory("MysteryBoxSale");
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.busdTokenFactory = await ethers.getContractFactory("ERC20Mock");
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.buyer = this.signers[1];
  });

  beforeEach(async function () {
    this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [TOKEN_URI]);
    this.busdToken = await this.busdTokenFactory.deploy("BUSDToken", "BUSD", initialSupply);
    this.mysteryBoxSale = await upgrades.deployProxy(this.mysteryBoxSaleFactory, [this.busdToken.address, this.metarunCollection.address]);
    const MINTER_ROLE = await this.metarunCollection.MINTER_ROLE();
    this.metarunCollection.grantRole(MINTER_ROLE, this.mysteryBoxSale.address);
    this.mysteryBoxKind = await this.metarunCollection.MYSTERY_BOX_KIND();
    this.mysteryBoxPrice = await this.mysteryBoxSale.mysteryBoxPrice();
    this.referrer = ethers.utils.formatBytes32String("Seller");
    await this.busdToken.mint(this.buyer.address, this.mysteryBoxPrice);
    await this.busdToken.connect(this.buyer).approve(this.mysteryBoxSale.address, initialSupply);
  });

  describe("Buy", function () {
    it("should increase sale contract's BUSD balance", async function () {
      const balanceBefore = await this.busdToken.balanceOf(this.mysteryBoxSale.address);
      expect(balanceBefore).to.be.eq(0);
      await this.mysteryBoxSale.connect(this.buyer).buy(this.referrer);
      const balanceAfter = await this.busdToken.balanceOf(this.mysteryBoxSale.address);
      expect(balanceAfter).to.be.eq(this.mysteryBoxPrice);
    });

    it("should decrease buyer's BUSD balance", async function () {
      const balanceBefore = await this.busdToken.balanceOf(this.buyer.address);
      expect(balanceBefore).to.be.eq(this.mysteryBoxPrice);
      await this.mysteryBoxSale.connect(this.buyer).buy(this.referrer);
      const balanceAfter = await this.busdToken.balanceOf(this.buyer.address);
      expect(balanceAfter).to.be.eq(0);
    });

    it("should increase buyer's mystery box balance", async function () {
      const tokenId = this.mysteryBoxKind << 16;
      const balanceBefore = await this.metarunCollection.balanceOf(this.buyer.address, tokenId);
      expect(balanceBefore).to.be.eq(0);
      await this.mysteryBoxSale.connect(this.buyer).buy(this.referrer);
      const balanceAfter = await this.metarunCollection.balanceOf(this.buyer.address, tokenId);
      expect(balanceAfter).to.be.eq(1);
    });

    it("should emit MysteryBoxBought event", async function () {
      const tokenId = this.mysteryBoxKind << 16;
      attempt = this.mysteryBoxSale.connect(this.buyer).buy(this.referrer);
      await expect(attempt).to.emit(this.mysteryBoxSale, "MysteryBoxBought").withArgs(this.buyer.address, tokenId, this.referrer);
    });

    it("should increase currentBoxId", async function () {
      const currentIdBefore = await this.mysteryBoxSale.currentBoxId();
      expect(currentIdBefore).to.be.eq(0);
      await this.mysteryBoxSale.connect(this.buyer).buy(this.referrer);
      const currentIdAfter = await this.mysteryBoxSale.currentBoxId();
      expect(currentIdAfter).to.be.eq(1);
    });

    it("can buy next box after buy", async function () {
      await this.busdToken.mint(this.buyer.address, this.mysteryBoxPrice);
      const currentCountBefore = await this.mysteryBoxSale.currentBoxCount();
      expect(currentCountBefore).to.be.eq(0);
      await this.mysteryBoxSale.connect(this.buyer).buy(this.referrer);
      await this.mysteryBoxSale.connect(this.buyer).buy(this.referrer);
      const currentCountAfter = await this.mysteryBoxSale.currentBoxCount();
      expect(currentCountAfter).to.be.eq(2);
    });

    it("can buy mystery box after single-mint mystery box", async function () {
      const tokenId = this.mysteryBoxKind << 16;
      const currentIdBefore = await this.mysteryBoxSale.currentBoxId();
      expect(currentIdBefore).to.be.eq(0);
      await this.metarunCollection.mint(this.deployer.address, tokenId, 1);
      await this.mysteryBoxSale.connect(this.buyer).buy(this.referrer);
      const currentIdAfter = await this.mysteryBoxSale.currentBoxId();
      expect(currentIdAfter).to.be.eq(2);
    });

    it("can buy mystery box after batch-mint mystery boxes", async function () {
      const currentIdBefore = await this.mysteryBoxSale.currentBoxId();
      expect(currentIdBefore).to.be.eq(0);
      await this.metarunCollection.mintBatch(this.deployer.address, this.mysteryBoxKind, 10);
      await this.mysteryBoxSale.connect(this.buyer).buy(this.referrer);
      const currentIdAfter = await this.mysteryBoxSale.currentBoxId();
      expect(currentIdAfter).to.be.eq(11);
    });
  });
  describe("Withdraw", function () {
    beforeEach(async function () {
      await this.mysteryBoxSale.connect(this.buyer).buy(this.referrer);
    });
    it("msg.sender with DEFAULT_ADMIN_ROLE can withdraw", async function () {
      await this.mysteryBoxSale.connect(this.deployer).withdrawPayments(this.buyer.address);
      const balanceAfter = await this.busdToken.balanceOf(this.buyer.address);
      expect(balanceAfter).to.be.eq(this.mysteryBoxPrice);
    });
    it("should revert if msg.sender without DEFAULT_ADMIN_ROLE role", async function () {
      attempt = this.mysteryBoxSale.connect(this.buyer).withdrawPayments(this.deployer.address);
      await expect(attempt).to.be.revertedWith("You should have DEFAULT_ADMIN_ROLE");
    });
    it("should revert if zero balance", async function () {
      await this.mysteryBoxSale.connect(this.deployer).withdrawPayments(this.buyer.address);
      attempt = this.mysteryBoxSale.connect(this.deployer).withdrawPayments(this.buyer.address);
      await expect(attempt).to.be.revertedWith("Zero balance");
    });
  });

  describe("Set Mystery Box Price", function () {
    beforeEach(async function () {
      this.newPrice = ethers.utils.parseUnits("100000", "gwei");
    });
    it("msg.sender with DEFAULT_ADMIN_ROLE can set price", async function () {
      expect(await this.mysteryBoxSale.mysteryBoxPrice()).to.be.eq(this.mysteryBoxPrice);
      await this.mysteryBoxSale.connect(this.deployer).setMysteryBoxPrice(this.newPrice);
      expect(await this.mysteryBoxSale.mysteryBoxPrice()).to.be.eq(this.newPrice);
    });
    it("should revert if msg.sender without DEFAULT_ADMIN_ROLE role", async function () {
      attempt = this.mysteryBoxSale.connect(this.buyer).setMysteryBoxPrice(this.newPrice);
      await expect(attempt).to.be.revertedWith("You should have DEFAULT_ADMIN_ROLE");
    });
  });
});
