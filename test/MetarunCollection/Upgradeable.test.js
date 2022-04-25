const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const URI_TOKEN = "localhost/api/{id}.json";

describe("MetarunCollection | Upgradeable", function () {
  const FIGHTER_CHARACTER_KIND = 0x0001;
  const CHARACTER_TOKEN_ID = (FIGHTER_CHARACTER_KIND << 16) + 123;
  beforeEach(async function () {
    const signers = await ethers.getSigners();
    this.deployer = signers[0];
    this.another = signers[1];
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
  });
  describe("Deploying", function () {
    beforeEach(async function () {
      this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
      await this.metarunCollection.deployed();
      this.metarunCollection.mint(this.deployer.address, CHARACTER_TOKEN_ID, 1);
    });
    it("check that account received a character token with a balance of 1", async function () {
      expect(await this.metarunCollection.balanceOf(this.deployer.address, CHARACTER_TOKEN_ID)).to.be.equal(1);
    });
    describe("Upgrading", function () {
      beforeEach(async function () {
        this.metarunCollectionUpgraded = await upgrades.upgradeProxy(this.metarunCollection.address, this.metarunCollectionFactory);
      });
      it("check that the account is still a character token with a balance of 1", async function () {
        expect(await this.metarunCollectionUpgraded.balanceOf(this.deployer.address, CHARACTER_TOKEN_ID)).to.be.equal(1);
      });
    });
  });
});
