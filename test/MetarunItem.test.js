const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("MetarunItem", function(){
    this.beforeAll(async function(){
        const MetarunItem = await ethers.getContractFactory("MetarunItem");
        this.token = await MetarunItem.deploy();
    });

    it("should be deployed", async function(){
        expect(this.token.address).not.to.be.null;
    });
});