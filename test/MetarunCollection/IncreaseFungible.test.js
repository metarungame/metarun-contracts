const { expect } = require("chai");
const { ethers } = require("hardhat");
const URI_TOKEN = "localhost/api/{id}.json";

describe("MetarunCollection | Increase/Decrease fungible token", function () {
  const FIGHTER_CHARACTER_KIND = 0x0001;
  const CHARACTER_TOKEN_ID = (FIGHTER_CHARACTER_KIND << 16) + 123;
  const FUNGIBLE_TOKEN_KIND = 0x0500;
  const HEALTH_TOKEN_ID = (FUNGIBLE_TOKEN_KIND << 16) + 0x0000;

  const amount = 50;
  const amountHalf = amount / 2;
  beforeEach(async function () {
    const signers = await ethers.getSigners();
    this.deployer = signers[0];
    this.another = signers[1];
    const metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.metarunCollection = await metarunCollectionFactory.deploy(URI_TOKEN);
  });
  describe("Increase token Health to character", function () {
    describe("Mint token Character for account", function () {
      beforeEach(async function () {
        this.metarunCollection.mint(this.deployer.address, CHARACTER_TOKEN_ID, 1);
      });
      it("check token Character balanceOf increased", async function () {
        expect(
          await this.metarunCollection.balanceOf(this.deployer.address, CHARACTER_TOKEN_ID)
        ).to.be.equal(1);
      });
      it("check reverts");
      describe("Mint token Health for account", function () {
        beforeEach(async function () {
          await this.metarunCollection.mint(this.deployer.address, HEALTH_TOKEN_ID, amount);
        });
        it("check token Health balanceOf increased", async function () {
          expect(
            await this.metarunCollection.balanceOf(this.deployer.address, HEALTH_TOKEN_ID)
          ).to.be.equal(amount);
        });
        it("check reverts");
        describe("Increase token Health to character", function () {
          beforeEach(async function () {
            await this.metarunCollection.increaseHealth(amount, CHARACTER_TOKEN_ID);
          });
          it("check token Health balance for account", async function () {
            expect(
              await this.metarunCollection.balanceOf(this.deployer.address, HEALTH_TOKEN_ID)
            ).to.be.equal(0);
          });
          it("check mappinig tokens Character and Health", async function () {
            expect(
              await this.metarunCollection.getHealth(CHARACTER_TOKEN_ID)
            ).to.be.equal(amount);
          });
          it("check reverts");
          describe("Decrease Health token from character", function () {
            beforeEach(async function () {
              await this.metarunCollection.decreaseHealth(amountHalf, CHARACTER_TOKEN_ID);
            });
            it("check amount token Health in mappinig Character and Health", async function () {
              expect(
                await this.metarunCollection.getHealth(CHARACTER_TOKEN_ID)
              ).to.be.equal(amount - amountHalf);
            });
            it("check token Health balance for account", async function () {
              expect(
                await this.metarunCollection.balanceOf(this.deployer.address, HEALTH_TOKEN_ID)
              ).to.be.equal(amount - amountHalf);
            });
            it("check reverts");
            describe("Transfer token Health to another account", function () {
              beforeEach(async function () {
                await this.metarunCollection.safeTransferFrom(
                  this.deployer.address,
                  this.another.address,
                  HEALTH_TOKEN_ID,
                  amountHalf,
                  []
                );
              });
              it("check token Health balance for account", async function () {
                expect(
                  await this.metarunCollection.balanceOf(this.deployer.address, HEALTH_TOKEN_ID)
                ).to.be.equal(0);
              });
              it("check token Health balance for another account", async function () {
                expect(
                  await this.metarunCollection.balanceOf(this.another.address, HEALTH_TOKEN_ID)
                ).to.be.equal(amountHalf);
              });
              it("check reverts");
            });
          });
        });
      });
    });
  });
});
