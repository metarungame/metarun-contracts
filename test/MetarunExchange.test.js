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
    this.domain = {
        name: "Metarun",
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
        seller: this.deployer.address,
        tokenId: 0,
        amount: 1,
        expirationTime: 2,
        price: 3,
        salt: 4
      };
  });

  beforeEach(async function () {
    this.collection = await this.metarunCollectionFactory.deploy(URI_TOKEN);
    this.exchange = await this.metarunExchangeFactory.deploy(this.collection.address);
  });

  it("is deployed", async function () {
    await this.exchange.deployed();
  });
});
