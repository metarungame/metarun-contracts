const { expect } = require("chai");
const { ethers } = require("hardhat");

const URI_TOKEN = "https://app-staging.metarun.game/metadata/{id}.json";

describe("MetarunCollection", function () {
  const amount = ethers.utils.parseEther("1.0");
  const firstTokenID = 0;

  beforeEach(async function () {
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.account1 = this.signers[1];
    this.account2 = this.signers[2];
    this.contract = await ethers.getContractFactory("MetarunCollection");
    this.token = await this.contract.deploy(URI_TOKEN);

  });
  describe("Checking for currentTokenID increase after every mint", function () {
    it("balance equals 0", async function () {
      expect(await this.token.balanceOf(this.deployer.address, firstTokenID)).to.equal(0);
    });
    describe("Mint first character token", function () {
      beforeEach(async function () {
        await this.token.mint(this.deployer.address, 1, 0, 0, 0);
      });
      it("balance equals 1", async function () {
        expect(await this.token.balanceOf(this.deployer.address, firstTokenID)).to.equal(1);
      });
      it("check currentTokenID increased by 1", async function () {
        expect(await this.token.currentTokenID()).to.equal(firstTokenID+1);
      });
      describe("Mint second token", function () {
        beforeEach(async function () {
          await this.token.mint(this.deployer.address, 1, 0, 0, 0);
        });
        it("balance equals 1", async function () {
          expect(await this.token.balanceOf(this.deployer.address, firstTokenID+1)).to.equal(1);
        });
        it("check currentTokenID increased by 1", async function () {
          expect(await this.token.currentTokenID()).to.equal(firstTokenID+2);
        });
      });
      describe("Checking the addition of characteristics for the character", function () {
        it("check character exists", async function () {
          expect(await this.token.balanceOf(this.deployer.address, firstTokenID)).to.equal(1);
        });
        it("check that character does not has characteristics", async function () {
          const characteristics = await this.token.getCharacteristics(firstTokenID);
          expect(characteristics.length).to.equal(0);
        });
        describe("Add characteristic a Skin", function () {
          beforeEach(async function () {
            await this.token.addCharacteristic(this.deployer.address, 10, 2, 1, 0, firstTokenID);
          });
          it("check that character characteristics", async function () {
            const characteristics = await this.token.getCharacteristics(firstTokenID);
            expect(characteristics.length).to.equal(1);
          });
          it("check characteristic type")
          it("check number of amount for characteristic")
          describe("Add characteristic a Skin", function () {
            it("check that character characteristics")
            it("check characteristic type")
            it("check number of amount for characteristic")
          });
        });
        describe("Checking the change in the number of fungible tokens", function () {
        });
      });
    });
    describe("Verification of the transfer of tokens", function () {
    });
  });
});