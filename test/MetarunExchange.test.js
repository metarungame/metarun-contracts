const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

const URI_TOKEN = "ipfs://ipfs/dag/{id}.json";

describe("Metarun Exchange", function() {
    before(async function() {
        this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
        this.metarunExchangeFactory = await ethers.getContractFactory("MetarunExchange");
        this.metarunTokenFactory = await ethers.getContractFactory("MetarunToken");
        this.signers = await ethers.getSigners();
        this.deployer = this.signers[0];
        this.stranger = this.signers[1];
        this.seller = this.signers[2];
        this.buyer = this.signers[3];
        this.domain = {
            name: "metarun.game",
            version: "0.1",
            chainId: this.deployer.provider._network.chainId,
            verifyingContract: null,
        };

        this.types = {
            SellOrder: [
                { name: "seller", type: "address" },
                { name: "tokenId", type: "uint256" },
                { name: "amount", type: "uint256" },
                { name: "expirationTime", type: "uint256" },
                { name: "price", type: "uint256" },
                { name: "salt", type: "uint256" },
            ],
        };

        this.sellOrder = {
            seller: this.seller.address,
            tokenId: 0,
            amount: 1,
            expirationTime: Math.floor(new Date().getTime() / 1000) + 3600,
            price: 3,
            salt: 4,
        };
    });

    beforeEach(async function() {
        this.collection = await this.metarunCollectionFactory.deploy();
        this.token = await this.metarunTokenFactory.deploy();
        await this.collection.initialize(URI_TOKEN);
        this.collection.mint(this.seller.address, 0, 1);
        await this.token.mint(this.buyer.address, this.sellOrder.price);
        this.exchange = await upgrades.deployProxy(this.metarunExchangeFactory, [this.collection.address, this.token.address]);
        await this.token.connect(this.buyer).approve(this.exchange.address, this.sellOrder.price);
        this.domain.verifyingContract = this.exchange.address;
    });

    it("is deployed", async function() {
        await this.exchange.deployed();
    });

    it("check typed order hashes", async function() {
        const soliditySellOrderHash = await this.exchange.hashSellOrder(this.sellOrder);
        const ethersSellOrderHash = ethers.utils._TypedDataEncoder.hash(this.domain, this.types, this.sellOrder);
        expect(soliditySellOrderHash).to.be.equal(ethersSellOrderHash);
    });

    it("can buy", async function() {
        // seller should approve the token before submitting SellOrder
        await this.collection.connect(this.seller).setApprovalForAll(this.exchange.address, true);
        const sellOrderHash = ethers.utils._TypedDataEncoder.hash(this.domain, this.types, this.sellOrder);
        const signature = await this.seller._signTypedData(this.domain, this.types, this.sellOrder);
        expect(await this.collection.balanceOf(this.seller.address, 0)).to.be.equal("1");
        expect(await this.collection.balanceOf(this.buyer.address, 0)).to.be.equal("0");
        const purchaseTx = await this.exchange.connect(this.buyer).buy(this.sellOrder, signature);
        await expect(purchaseTx)
            .to.emit(this.exchange, "Purchase")
            .withArgs(sellOrderHash, this.sellOrder.seller, this.buyer.address, this.sellOrder.tokenId, this.sellOrder.amount, this.sellOrder.price);
        expect(await this.collection.balanceOf(this.seller.address, 0)).to.be.equal("0");
        expect(await this.collection.balanceOf(this.buyer.address, 0)).to.be.equal("1");
    });

    it("change mrun balance after buy", async function() {
        expect(await this.token.balanceOf(this.buyer.address)).to.be.equal(this.sellOrder.price);
        expect(await this.token.balanceOf(this.seller.address)).to.be.equal("0");
        await this.collection.connect(this.seller).setApprovalForAll(this.exchange.address, true);
        const signature = await this.seller._signTypedData(this.domain, this.types, this.sellOrder);
        await this.exchange.connect(this.buyer).buy(this.sellOrder, signature);
        expect(await this.token.balanceOf(this.buyer.address)).to.be.equal("0");
        expect(await this.token.balanceOf(this.seller.address)).to.be.equal(this.sellOrder.price);
    });

    it("reverts an expired sell order", async function() {
        let dummySellOrder = {};
        Object.assign(dummySellOrder, this.sellOrder);
        dummySellOrder.expirationTime = Math.floor(new Date().getTime() / 1000);
        await this.collection.connect(this.seller).setApprovalForAll(this.exchange.address, true);
        const signature = await this.seller._signTypedData(this.domain, this.types, dummySellOrder);
        const purchaseTx = this.exchange.connect(this.buyer).buy(dummySellOrder, signature);
        await expect(purchaseTx).to.be.revertedWith("EXPIRED");
    });

    it("reverts whether sell order is already done", async function() {
        await this.collection.connect(this.seller).setApprovalForAll(this.exchange.address, true);
        const signature = await this.seller._signTypedData(this.domain, this.types, this.sellOrder);
        await this.exchange.connect(this.buyer).buy(this.sellOrder, signature);
        const secondTx = this.exchange.connect(this.buyer).buy(this.sellOrder, signature);
        await expect(secondTx).to.be.revertedWith("ALREADY_DONE");
    });
});