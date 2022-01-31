const { expect } = require("chai");
const { ethers } = require("hardhat");

const URI_TOKEN = "localhost:8000/static/collection/{id}.json";

describe("Metarun token collection", function () {

    it("is deployed", async function () {
        this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
        this.metarunCollection = await this.metarunCollectionFactory.deploy(URI_TOKEN);
        await this.metarunCollection.deployed();
        this.signers = await ethers.getSigners();
        this.deployer = this.signers[0];
        this.stranger = this.signers[1];
        this.firstTokenId = await this.metarunCollection.FIRST_TOKEN();
        this.secondTokenId = await this.metarunCollection.SECOND_TOKEN();
        this.tokenWithTwoInstances = await this.metarunCollection.TWO_INSTANCE_TOKEN();
    });

    describe("Token creation", function () {

        async function testTokenCreation(collectionToken, deployer, tokenId, expectedAmount) {
            const balanceOfFirstToken = await collectionToken.balanceOf(deployer, tokenId);
            expect(balanceOfFirstToken).to.be.eq(expectedAmount);
        }

        it("should create non-fungible tokens correctly", async function () {
            await testTokenCreation(this.metarunCollection, this.deployer.address, this.firstTokenId, "1");
            await testTokenCreation(this.metarunCollection, this.deployer.address, this.secondTokenId, "1");
            await testTokenCreation(this.metarunCollection, this.deployer.address, this.tokenWithTwoInstances, "2");
        });

        it("should give zero if token does not exist", async function () {
            const dummyBalance = await this.metarunCollection.balanceOf(this.deployer.address, 9999);
            expect(dummyBalance).to.be.eq(0);
        });
    });

    describe("Token transfer", async function () {
        it("should perform a transfer correctly", async function () {
            await this.metarunCollection.safeTransferFrom(this.deployer.address, this.stranger.address, this.firstTokenId, 1, []);
            const balance = await this.metarunCollection.balanceOf(this.stranger.address, 0);
            expect(balance).to.be.eq(1);
        });

        it("should revert transfer more than 1 NFT", async function () {
            const transfer = this.metarunCollection.connect(this.stranger).safeTransferFrom(this.stranger.address, this.deployer.address, this.firstTokenId, 2, []);
            await expect(transfer).to.be.revertedWith("ERC1155: insufficient balance for transfer");
        });

        it("should perform a transfer 2 items of two-instance token", async function () {
            const transfer = this.metarunCollection.connect(this.deployer).
                safeTransferFrom(this.deployer.address, this.stranger.address, this.tokenWithTwoInstances, 2, []);
            await expect(transfer).to.be.ok;
        });
    });

    describe("Token uri", function () {

        async function testUriGiving(collectionToken, tokenId) {
            const uri = await collectionToken.uri(tokenId);
            expect(uri).to.be.eq(URI_TOKEN);
        }

        it("should correctly give uri for tokens", async function () {
            testUriGiving(this.metarunCollection, this.firstTokenId);
            testUriGiving(this.metarunCollection, this.secondTokenId);
            testUriGiving(this.metarunCollection, this.tokenWithTwoInstances);
        });

    });

});
