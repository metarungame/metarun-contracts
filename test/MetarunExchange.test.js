const { expect } = require("chai");
const { ethers } = require("hardhat");

const URI_TOKEN = "ipfs://ipfs/dag/{id}.json";

describe("Metarun Exchange", function () {
  before(async function () {
    this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
    this.metarunExchangeFactory = await ethers.getContractFactory("MetarunExchange");
    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.stranger = this.signers[1];
    this.seller = this.signers[2];
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
      expirationTime: 2,
      price: 3,
      salt: 4,
    };
  });

  beforeEach(async function () {
    this.collection = await this.metarunCollectionFactory.deploy(URI_TOKEN);
    this.exchange = await this.metarunExchangeFactory.deploy(this.collection.address);
    this.domain.verifyingContract = this.exchange.address;
  });

  it("is deployed", async function () {
    await this.exchange.deployed();
  });

  it("check typed order hashes", async function () {
    const soliditySellOrderHash = await this.exchange.hashSellOrder(this.sellOrder);
    const ethersSellOrderHash = ethers.utils._TypedDataEncoder.hash(this.domain, this.types, this.sellOrder);
    expect(soliditySellOrderHash).to.be.equal(ethersSellOrderHash);
  });

  it("can buy", async function () {
    const signature = await this.seller._signTypedData(this.domain, this.types, this.sellOrder);
    await this.exchange.buy(this.sellOrder, signature, { value: this.sellOrder.price });
  });
});
