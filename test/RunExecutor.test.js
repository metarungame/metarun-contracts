const { expect } = require("chai");
const { ethers } = require("hardhat");
URI_TOKEN = "localhost:8000/{id}.json";


describe("RunExecutor", function () {
    this.beforeAll(async function () {
        this.metarunCollectionFactory = await ethers.getContractFactory("MetarunCollection");
        this.runExecutorFactory = await ethers.getContractFactory("RunExecutor");
        this.signers = await ethers.getSigners();
        this.winner = this.signers[1].address;
        this.looser = this.signers[2].address;
    });

    beforeEach(async function () {
        this.metarunCollection = await upgrades.deployProxy(this.metarunCollectionFactory, [URI_TOKEN]);
        this.runExecutor = await upgrades.deployProxy(this.runExecutorFactory, [this.metarunCollection.address]);

        const MINTER_ROLE = await this.metarunCollection.MINTER_ROLE();
        const SETTER_ROLE = await this.metarunCollection.SETTER_ROLE();
        this.metarunCollection.grantRole(MINTER_ROLE, this.runExecutor.address);
        this.metarunCollection.grantRole(SETTER_ROLE, this.runExecutor.address)
    });

    it("should perform a run successfully", async function () {
        const winnerCharacterTokenId =  ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 1;
        const looserCharacterTokenId =  ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
        const expectedWinnerBalance = 100;
        const expectedLooserBalance = 10;
        let run = {
            "winner": this.winner,
            "looser": this.looser,
            "winnerCharacterTokenId": winnerCharacterTokenId,
            "looserCharacterTokenId": looserCharacterTokenId,
            "winnerOpal": expectedWinnerBalance,
            "looserOpal": expectedLooserBalance,
            "winnerExperience": 500,
        }
        this.runExecutor.executeRun(run);
        const opalId = await this.metarunCollection.OPAL_TOKEN_ID();
        const actualWinnerBalance = await this.metarunCollection.balanceOf(this.winner, opalId);
        const actualLooserBalance = await this.metarunCollection.balanceOf(this.looser, opalId);
        expect(actualWinnerBalance).to.be.eq(expectedWinnerBalance);
        expect(actualLooserBalance).to.be.eq(expectedLooserBalance);

    });

    it("should revert for non-deployer", async function(){
        let run = {
            "winner": this.winner,
            "looser": this.looser,
            "winnerCharacterTokenId": 1,
            "looserCharacterTokenId": 1,
            "winnerOpal": 1,
            "looserOpal": 1,
            "winnerExperience": 1,
        }
        const attempt = this.runExecutor.connect(this.signers[1]).executeRun(run);
        await expect(attempt).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should revert for bad winner token id", async function(){
        const badWinnerCharacterTokenId =  ((await this.metarunCollection.RARE_SKIN_KIND()) << 16) + 1;
        const looserCharacterTokenId =  ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
        let run = {
            "winner": this.winner,
            "looser": this.looser,
            "winnerCharacterTokenId": badWinnerCharacterTokenId,
            "looserCharacterTokenId": looserCharacterTokenId,
            "winnerOpal": 1,
            "looserOpal": 1,
            "winnerExperience": 1,
        }
        const attempt = this.runExecutor.executeRun(run);
        await expect(attempt).to.be.revertedWith("RunExecutor: winner's character token id should be valid");
    }); 

    it("should revert for bad looser token id", async function(){
        const winnerCharacterTokenId =  ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 1;
        const badLooserCharacterTokenId =  ((await this.metarunCollection.RARE_SKIN_KIND()) << 16) + 3;
        let run = {
            "winner": this.winner,
            "looser": this.looser,
            "winnerCharacterTokenId": winnerCharacterTokenId,
            "looserCharacterTokenId": badLooserCharacterTokenId,
            "winnerOpal": 1,
            "looserOpal": 1,
            "winnerExperience": 1,
        }
        const attempt = this.runExecutor.executeRun(run);
        await expect(attempt).to.be.revertedWith("RunExecutor: looser's character token id should be valid");
    }); 

    it("should revert for bad winner opal amount", async function(){
        const winnerCharacterTokenId =  ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 1;
        const looserCharacterTokenId =  ((await this.metarunCollection.FIGHTER_CHARACTER_KIND()) << 16) + 3;
        let run = {
            "winner": this.winner,
            "looser": this.looser,
            "winnerCharacterTokenId": winnerCharacterTokenId,
            "looserCharacterTokenId": looserCharacterTokenId,
            "winnerOpal": 0,
            "looserOpal": 1,
            "winnerExperience": 1,
        }
        const attempt = this.runExecutor.executeRun(run);
        await expect(attempt).to.be.revertedWith("RunExecutor: winner's opal to be minted should be defined");
    });
});