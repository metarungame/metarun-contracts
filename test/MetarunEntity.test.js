const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MetarunEntity", function () {
  this.beforeAll(async function () {
    this.MetarunEntity = await ethers.getContractFactory("MetarunEntity");
    this.metarunEntity = await this.MetarunEntity.deploy();
  });

  it("should create new character", async function () {
    const rarity = 2;
    const skinRarity = 5;
    const characterClass = 12;
    const owner = ethers.utils.getAddress("0x0000000000000000000000000000000000000081");
    const health = 32;
    const mana = 10;
    const collisionDamage = 1000;
    const speed = 200;
    const maxLevel = 32;
    const league = 6;
    await this.metarunEntity.createCharacter(rarity, skinRarity, characterClass, owner, health, mana, collisionDamage, speed, maxLevel, league);
    const currentDay = Math.floor(new Date().getTime() / 86400000);
    const result = await this.metarunEntity.getCharacter(0);
    expect(result[0]).to.be.equal(rarity);
    expect(result[1]).to.be.equal(skinRarity);
    expect(result[2]).to.be.equal(characterClass);
    expect(result[3]).to.be.equal(owner);
    expect(result[4]).to.be.equal(0);
    expect(result[5]).to.be.equal(0);
    expect(result[6]).to.be.equal(0);
    expect(result[7]).to.be.equal(0);
    expect(result[8]).to.be.equal(health);
    expect(result[9]).to.be.equal(mana);
    expect(result[10]).to.be.equal(collisionDamage);
    expect(result[11]).to.be.equal(speed);
    expect(result[12]).to.be.equal(0);
    expect(result[13]).to.be.equal(maxLevel);
    expect(result[14][0]).to.be.equal(0);
    expect(result[14][1]).to.be.equal(0);
    expect(result[15][0]).to.be.equal(0);
    expect(result[15][1]).to.be.equal(0);
    expect(result[16]).to.be.equal(0);
    expect(result[17]).to.be.equal(league);
    expect(result[18][0]).to.be.equal(0);
    expect(result[18][1]).to.be.equal(0);
    expect(result[18][2]).to.be.equal(0);
    expect(result[19][0]).to.be.equal(0);
    expect(result[20]).to.be.equal(0);
    expect(result[21]).to.be.equal(0);
    expect(result[22]).to.be.equal(currentDay);
  });

  describe("victory handling", function () {
    this.beforeAll(async function () {
      const playerWinner = ethers.utils.getAddress("0x0000000000000000000000000000000000000001");
      const playerLooser = ethers.utils.getAddress("0x0000000000000000000000000000000000000002");
      await this.metarunEntity.createCharacter(1, 1, 1, playerWinner, 1, 1, 1, 1, 1, 1);
      await this.metarunEntity.createCharacter(2, 2, 2, playerLooser, 2, 2, 2, 2, 2, 2);
      await this.metarunEntity.handleVictory(0, 1, 10);
      // 0 is tokenId of winner
      // 1 is tokenId of looser
    });

    it("should increase victory count to winner", async function () {
      const character = await this.metarunEntity.getCharacter(0);
      expect(character[20]).to.be.equal(1);
    });

    it("should increase total run count to winner", async function () {
      const character = await this.metarunEntity.getCharacter(0);
      expect(character[21]).to.be.equal(1);
    });

    it("should not increase victory count to looser", async function () {
      const character = await this.metarunEntity.getCharacter(1);
      expect(character[20]).to.be.equal(0);
    });

    it("should increase total run count to looser", async function () {
      const character = await this.metarunEntity.getCharacter(1);
      expect(character[21]).to.be.equal(1);
    });
  });
});
