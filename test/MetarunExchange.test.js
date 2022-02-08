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
  });

  beforeEach(async function () {
    this.collection = await this.metarunCollectionFactory.deploy(URI_TOKEN);
    this.exchange = await this.metarunExchangeFactory.deploy(this.collection.address);
  });

  it("is deployed", async function () {
    await this.exchange.deployed();
  });
});
