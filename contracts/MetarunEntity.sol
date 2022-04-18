// SPDX-License-Identifier: MIT

pragma solidity ^0.8.1;

contract MetarunEntity {
    event CharacterCreated(uint256 tokenId);

    struct ActiveAbility {
        uint256 currentLevel;
        uint256 maxLevel;
    }

    struct PassiveAbility {
        uint256 currentLevel;
        uint256 maxLevel;
    }

    struct Pet {
        uint256 rarity;
        uint256 currentLevel;
        uint256 maxLevel;
    }

    struct Artifact {
        uint256 rarity;
    }

    struct Character {
        uint256 rarity;
        uint256 skinRarity;
        uint256 characterClass;
        address owner;
        uint256 racesWithIncomeCount;
        uint256 raceIncomeMax;
        uint256 raceIncomePerDay;
        uint256 lastWrittenDay;
        uint256 health;
        uint256 mana;
        uint256 collisionDamage;
        uint256 speed;
        uint256 currentLevel;
        uint256 maxLevel;
        ActiveAbility activeAbility;
        PassiveAbility passiveAbility;
        uint256 currentPoints;
        uint256 league;
        Pet pet;
        Artifact artifact;
        uint256 runsVictory;
        uint256 runsTotal;
        uint256 ownershipStart;
    }

    mapping(uint256 => Character) characters;
    uint256 characterIterator = 0;

    function createCharacter(
        uint256 rarity,
        uint256 skinRarity,
        uint256 characterClass,
        address owner,
        uint256 health,
        uint256 mana,
        uint256 collisionDamage,
        uint256 speed,
        uint256 maxLevel,
        uint256 league
    ) public {
        Character memory character = Character({
            rarity: rarity,
            skinRarity: skinRarity,
            characterClass: characterClass,
            owner: owner,
            racesWithIncomeCount: 0,
            raceIncomeMax: 0,
            raceIncomePerDay: 0,
            lastWrittenDay: 0,
            health: health,
            mana: mana,
            collisionDamage: collisionDamage,
            speed: speed,
            currentLevel: 0,
            maxLevel: maxLevel,
            currentPoints: 0,
            league: league,
            runsVictory: 0,
            runsTotal: 0,
            ownershipStart: getCurrentDay(),
            pet: Pet(0, 0, 0),
            artifact: Artifact(0),
            activeAbility: ActiveAbility(0, 0),
            passiveAbility: PassiveAbility(0, 0)
        });
        emit CharacterCreated(characterIterator);
        characters[characterIterator++] = character;
    }

    function getCharacter(uint256 tokenId) public view returns (Character memory) {
        return characters[tokenId];
    }

    function getCurrentDay() public view returns (uint256) {
        return block.timestamp / 86400;
    }

    function handleVictory(
        uint256 characterWinner,
        uint256 characterLooser,
        uint256 gainedPoints
    ) public {
        characters[characterWinner].runsVictory++;
        characters[characterWinner].runsTotal++;
        characters[characterLooser].runsTotal++;

        characters[characterWinner].racesWithIncomeCount++;
        if (characters[characterWinner].raceIncomeMax < gainedPoints) {
            characters[characterWinner].raceIncomeMax = gainedPoints;
        }

        uint256 currentDay = getCurrentDay();
        if (currentDay == characters[characterWinner].lastWrittenDay) {
            characters[characterWinner].raceIncomePerDay += gainedPoints;
        } else {
            characters[characterWinner].raceIncomePerDay = gainedPoints;
        }
    }
}
