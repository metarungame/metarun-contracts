// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract MetarunItem {
    struct Ability {
        uint256 levelUp;
        uint256 milestoneLevel;
    }

    struct Skin {
        uint256 rarity;
        uint256 maxLevel;
        uint256 winBonus;
        uint256 looseBonus;
    }

    struct Artifact {
        uint256 rarity;
        uint256 maxHealthIncreasement;
        uint256 maxManaIncreasement;
        uint256 collisionDamageIncreasement;
    }

    struct Pet {
        uint256 rarity;
        uint256 level;
        Ability ability;
    }

    struct Character {
        uint256 characterClass;
        uint256 health;
        uint256 mana;
        uint256 collisionDamage;
        uint256 startingSpeed;
        uint256 rarity;
        uint256 level;
        uint256 raceLimit;
        uint256 racesCount;
        uint256 skin;
        Ability[] activeAbilities;
        uint256 activeAbilitiesCount;
        Ability[] passiveAbilities;
        uint256 passiveAbilitiesCount;
        uint256[] pets;
        uint256 petsCount;
        uint256[] artifacts;
        uint256 artifactsCount;
    }

    Ability[] allAbilities;
    Pet[] allPets;
    Artifact[] allArtifacts;
    Character[] allCharacters;
    Skin[] allSkins;

    constructor() {
        /*
        Thinking in constructor of contract:
        1) Should we store all items together in one storage with indexes?
        2) Should we give token ids for characters, allPets, artifacts together or separately?
        3) Should we provide way of getting token id by instance (e.g. tokenIdOf() method)
        4) Where should parameters (affected by e.g. artifacts) be calculated: inside contract or outside?
        5) What shall we do with artifact merged into character: delete or mark as merged?
        6) Should we store token id together with item (i.e. providing a struct's field token_id)?
        */
    }

    function getAbilitiesByIds(uint256[] memory _abilities) public returns (Ability[] memory result) {
        result = new Ability[](_abilities.length);
        for (uint256 i = 0; i < _abilities.length; i++) {
            uint256 activeAbility = _abilities[i];
            require(allAbilities.length < activeAbility);
            require(allAbilities[activeAbility].levelUp != 0);
            require(allAbilities[activeAbility].milestoneLevel != 0);
            result[i] = allAbilities[activeAbility];
        }
    }

    function createCharacter(
        uint256 _characterClass,
        uint256 _health,
        uint256 _mana,
        uint256 _collisionDamage,
        uint256 _startingSpeed,
        uint256 _rarity,
        uint256 _level,
        uint256 _raceLimit,
        uint256 _skinId,
        uint256[] memory _activeAbilities,
        uint256 _activeAbilitiesCount,
        uint256[] memory _passiveAbilities,
        uint256 _passiveAbilitiesCount,
        uint256[] memory _pets,
        uint256[] memory _artifacts
    ) public {
        /*
            Thinking on this method:
            1) Should one specify limit count of passive/active allAbilities?
            2) Should we give opportunity to add many active allAbilities? many passive ones?
            3) Should we validate token ids for allAbilities/allPets/artifacts? Or just pass them as is
            4) Should we validate token id for _skinId?
            5) Should we store created Character as a token (with corresponding token id)? Or
            6) store created Character as a object in array of (objects with corresponding index)?
        */
       

        Ability[] memory passiveAbilities = getAbilitiesByIds(_passiveAbilities); 
        Ability[] memory activeAbilities = getAbilitiesByIds(_activeAbilities); 

        Character memory character = Character(
            _characterClass,
            _health,
            _mana,
            _collisionDamage,
            _startingSpeed,
            _rarity,
            _level,
            _raceLimit,
            0,
            _skinId,
            activeAbilities,
            _activeAbilitiesCount,
            passiveAbilities,
            _passiveAbilitiesCount,
            _pets,
            allPets.length,
            _artifacts,
            _artifacts.length
        );
        allCharacters.push(character);
    }
}
