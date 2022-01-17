const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Metarun token", function () {
  const totalSupplyAmount = ethers.utils.parseUnits("1000000000");

  beforeEach(async function () {
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.account1 = this.signers[1];
    this.account2 = this.signers[2];
    this.contract = await ethers.getContractFactory("MetarunToken");
    this.token = await this.contract.deploy();
    await this.token.mint(this.deployer.address, totalSupplyAmount);
  });

  it("has a name", async function () {
    expect(await this.token.name()).to.equal("METARUN");
  });

  it("has a symbol", async function () {
    expect(await this.token.symbol()).to.equal("MRUN");
  });

  it("has 18 decimals", async function () {
    expect(await this.token.decimals()).to.equal(18);
  });

  it("returns the total amount of tokens", async function () {
    expect(await this.token.totalSupply()).to.equal(totalSupplyAmount);
  });

  it("returns the balance of deployer", async function () {
    expect(await this.token.balanceOf(this.deployer.address)).to.equal(totalSupplyAmount);
  });

  describe("Checking token methods", function () {
    const amount = ethers.utils.parseUnits("1");

    describe("Basic transfers", function () {
      beforeEach(async function () {
        deployerGFTSBalance = await this.token.balanceOf(this.deployer.address);
        transfer = await this.token.connect(this.deployer).transfer(this.account1.address, amount);
      });

      it("emits event Transfer", async function () {
        await expect(transfer)
          .to.emit(this.token, "Transfer")
          .withArgs(this.deployer.address, this.account1.address, amount);
      });

      it("spender's balance decreased", async function () {
        expect(await this.token.balanceOf(this.deployer.address)).to.equal(deployerGFTSBalance.sub(amount));
      });

      it("receiver's balance increased", async function () {
        expect(await this.token.balanceOf(this.account1.address)).to.equal(amount);
      });

      it("reverts if account1 has not enough balance", async function () {
        await expect(
          this.token.connect(this.account1).transfer(this.account2.address, amount.add(1))
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      });
    });

    describe("Approve", function () {
      beforeEach(async function () {
        approve = await this.token.connect(this.deployer).approve(this.account1.address, amount);
      });

      it("emits event Approval", async function () {
        await expect(approve)
          .to.emit(this.token, "Approval")
          .withArgs(this.deployer.address, this.account1.address, amount);
      });

      it("allowance to account1", async function () {
        expect(await this.token.allowance(this.deployer.address, this.account1.address)).to.equal(amount);
      });

      it("reverts if ZERO_ADDRESS", async function () {
        await expect(
          this.token.connect(this.deployer).approve(ethers.constants.AddressZero, amount)
        ).to.be.revertedWith("ERC20: approve to the zero address");
      });

      describe("transferFrom", function () {
        beforeEach(async function () {
          deployerGFTSBalance = await this.token.balanceOf(this.deployer.address);
          transferFrom = await this.token
            .connect(this.account1)
            .transferFrom(this.deployer.address, this.account2.address, amount);
        });

        it("emits event Transfer", async function () {
          await expect(transferFrom)
            .to.emit(this.token, "Transfer")
            .withArgs(this.deployer.address, this.account2.address, amount);
        });

        it("emits event Approval (allowance decreased)", async function () {
          await expect(transferFrom)
            .to.emit(this.token, "Approval")
            .withArgs(this.deployer.address, this.account1.address, 0);
        });

        it("deployer allowance to account1", async function () {
          expect(await this.token.allowance(this.deployer.address, this.account1.address)).to.equal(0);
        });

        it("deployer balance after transfer", async function () {
          expect(await this.token.balanceOf(this.deployer.address)).to.equal(deployerGFTSBalance.sub(amount));
        });

        it("check account2 balance after transfer", async function () {
          expect(await this.token.balanceOf(this.account2.address)).to.equal(amount);
        });

        it("reverts if account1 has not enough allowance", async function () {
          transferFrom = this.token
            .connect(this.account1)
            .transferFrom(this.deployer.address, this.account2.address, amount.add(1));

          await expect(transferFrom).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
        });
      });
    });

    describe("increaseAllowance", function () {
      beforeEach(async function () {
        increaseAllowanceResult = await this.token
          .connect(this.deployer)
          .increaseAllowance(this.account1.address, amount);
      });

      it("emits event Approval", async function () {
        await expect(increaseAllowanceResult)
          .to.emit(this.token, "Approval")
          .withArgs(this.deployer.address, this.account1.address, amount);
      });

      it("check deployer allowance to account1", async function () {
        expect(await this.token.allowance(this.deployer.address, this.account1.address)).to.equal(amount);
      });

      describe("decreaseAllowance", function () {
        beforeEach(async function () {
          decreaseAllowanceResult = await this.token
            .connect(this.deployer)
            .decreaseAllowance(this.account1.address, amount.div(2));
        });

        it("emits event Approval", async function () {
          const allowance = await this.token.allowance(this.deployer.address, this.account1.address);
          await expect(decreaseAllowanceResult)
            .to.emit(this.token, "Approval")
            .withArgs(this.deployer.address, this.account1.address, amount.sub(allowance));
        });

        it("deployer allowance to account1", async function () {
          expect(await this.token.allowance(this.deployer.address, this.account1.address)).to.equal(
            amount.sub(amount.div(2))
          );
        });

        it("reverts when decreased allowance below zero", async function () {
          await expect(
            this.token.connect(this.deployer).decreaseAllowance(this.account1.address, amount.div(2).add(1))
          ).to.be.revertedWith("ERC20: decreased allowance below zero");
        });
      });
    });
  });
});
