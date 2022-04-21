// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MetarunCollection is ERC1155, AccessControl {
    uint256 internal constant KIND_MASK = 0xffff0000;
    uint256 internal constant ID_MASK = 0x0000ffff;

    uint256 public constant CRAFTSMAN_CHARACTER_KIND = 0x0000;
    uint256 public constant FIGHTER_CHARACTER_KIND = 0x0001;
    uint256 public constant SPRINTER_CHARACTER_KIND = 0x0002;

    uint256 public constant ARTIFACT_TOKEN_KIND = 0x0100;
    uint256 public constant PET_TOKEN_KIND = 0x0200;
    uint256 public constant SKIN_TOKEN_KIND = 0x0300;
    uint256 public constant RAFFLE_TICKET_TOKEN_KIND = 0x0400;

    uint256 public constant FUNGIBLE_TOKEN_KIND = 0x0500;
    uint256 public constant HEALTH_TOKEN_ID = (FUNGIBLE_TOKEN_KIND << 16) + 0x0000;
    uint256 public constant MANA_TOKEN_ID = (FUNGIBLE_TOKEN_KIND << 16) + 0x0001;
    uint256 public constant SPEED_TOKEN_ID = (FUNGIBLE_TOKEN_KIND << 16) + 0x0002;
    uint256 public constant COLLISION_DAMAGE_TOKEN_ID = (FUNGIBLE_TOKEN_KIND << 16) + 0x0003;

    mapping(uint256 => uint256) tokenLevels;

    mapping(uint256 => uint256) tokenRuns;
    mapping(uint256 => uint256) tokenWins;

    mapping(uint256 => uint256) tokenAbilities;

    mapping(uint256 => uint256) tokenHealthPoints;
    mapping(uint256 => uint256) tokenManaPoints;
    mapping(uint256 => uint256) tokenSpeedPoints;
    mapping(uint256 => uint256) tokenCollisionDamagePoints;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant LEVEL_SETTER_ROLE = keccak256("LEVEL_SETTER_ROLE");
    bytes32 public constant RUNS_COUNT_SETTER_ROLE = keccak256("RUNS_COUNT_SETTER_ROLE");
    bytes32 public constant WINS_COUNT_SETTER_ROLE = keccak256("WINS_COUNT_SETTER_ROLE");

    bytes32 public constant ABILITY_SETTER_ROLE = keccak256("ABILITY_SETTER_ROLE");

    bytes32 public constant HEALTH_SETTER_ROLE = keccak256("HEALTH_SETTER_ROLE");
    bytes32 public constant MANA_SETTER_ROLE = keccak256("MANA_SETTER_ROLE");
    bytes32 public constant SPEED_SETTER_ROLE = keccak256("SPEED_SETTER_ROLE");
    bytes32 public constant COLLISION_DAMAGE_SETTER_ROLE = keccak256("COLLISION_DAMAGE_SETTER_ROLE");

    constructor(string memory uri) ERC1155(uri) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(LEVEL_SETTER_ROLE, _msgSender());
        _setupRole(RUNS_COUNT_SETTER_ROLE, _msgSender());
        _setupRole(WINS_COUNT_SETTER_ROLE, _msgSender());

        _setupRole(ABILITY_SETTER_ROLE, _msgSender());

        _setupRole(HEALTH_SETTER_ROLE, _msgSender());
        _setupRole(MANA_SETTER_ROLE, _msgSender());
        _setupRole(SPEED_SETTER_ROLE, _msgSender());
        _setupRole(COLLISION_DAMAGE_SETTER_ROLE, _msgSender());
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount
    ) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "METARUNCOLLECTION: need MINTER_ROLE");
        if (!isFungible(id)) {
            require(amount == 1, "Cannot mint more than one item");
            require(balanceOf(to, id) == 0, "Cannot mint more than one item");
        }
        _mint(to, id, amount, "");
    }

    function getKind(uint256 id) public pure returns (uint256) {
        return (KIND_MASK & id) >> 16;
    }

    function isKind(uint256 id, uint256 kind) public pure returns (bool) {
        return getKind(id) == kind;
    }

    function isFungible(uint256 id) public pure returns (bool) {
        return isKind(id, FUNGIBLE_TOKEN_KIND);
    }

    function isCharacter(uint256 id) public pure returns (bool) {
        return isKind(id, CRAFTSMAN_CHARACTER_KIND) || isKind(id, FIGHTER_CHARACTER_KIND) || isKind(id, SPRINTER_CHARACTER_KIND);
    }

    function isArtifact(uint256 id) public pure returns (bool) {
        return isKind(id, ARTIFACT_TOKEN_KIND);
    }

    function isPet(uint256 id) public pure returns (bool) {
        return isKind(id, PET_TOKEN_KIND);
    }

    function isSkin(uint256 id) public pure returns (bool) {
        return isKind(id, SKIN_TOKEN_KIND);
    }

    function isRaffleTicket(uint256 id) public pure returns (bool) {
        return isKind(id, RAFFLE_TICKET_TOKEN_KIND);
    }

    function setURI(string memory newUri) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "METARUNCOLLECTION: need DEFAULT_ADMIN_ROLE");
        _setURI(newUri);
    }

    function getLevel(uint256 id) public view returns (uint256) {
        require(isCharacter(id) || isPet(id), "Level is available only for pet or character");
        return tokenLevels[id];
    }

    function setLevel(uint256 id, uint256 level) public {
        require(isCharacter(id) || isPet(id), "Level is available only for pet or character");
        require(hasRole(LEVEL_SETTER_ROLE, _msgSender()), "METARUNCOLLECTION: need LEVEL_SETTER_ROLE");
        tokenLevels[id] = level;
    }

    function getRunCount(uint256 id) public view returns (uint256) {
        require(isCharacter(id), "Runs count is available only for character");
        return tokenRuns[id];
    }

    function setRunCount(uint256 id, uint256 runsCount) public {
        require(isCharacter(id), "Runs count is available only for character");
        require(hasRole(RUNS_COUNT_SETTER_ROLE, _msgSender()), "METARUNCOLLECTION: need RUNS_COUNT_SETTER_ROLE");
        tokenRuns[id] = runsCount;
    }

    function getWinCount(uint256 id) public view returns (uint256) {
        require(isCharacter(id), "Wins count is available only for character");
        return tokenWins[id];
    }

    function setWinCount(uint256 id, uint256 winsCount) public {
        require(isCharacter(id), "Wins count is available only for character");
        require(hasRole(WINS_COUNT_SETTER_ROLE, _msgSender()), "METARUNCOLLECTION: need WINS_COUNT_SETTER_ROLE");
        tokenWins[id] = winsCount;
    }

    function getAbility(uint256 id) public view returns (uint256) {
        require(isCharacter(id), "Ability is available only for character");
        return tokenAbilities[id];
    }

    function setAbility(uint256 id, uint256 ability) public {
        require(isCharacter(id), "Ability is available only for character");
        require(hasRole(ABILITY_SETTER_ROLE, _msgSender()), "METARUNCOLLECTION: need ABILITY_SETTER_ROLE");
        tokenAbilities[id] = ability;
    }

    function getHealth(uint256 id) public view returns (uint256) {
        require(isCharacter(id), "Health is available only for character");
        return tokenHealthPoints[id];
    }

    function setHealth(uint256 id, uint256 health) public {
        require(isCharacter(id), "Health is available only for character");
        require(hasRole(HEALTH_SETTER_ROLE, _msgSender()), "METARUNCOLLECTION: need HEALTH_SETTER_ROLE");
        tokenHealthPoints[id] = health;
    }

    function getMana(uint256 id) public view returns (uint256) {
        require(isCharacter(id), "Mana is available only for character");
        return tokenManaPoints[id];
    }

    function setMana(uint256 id, uint256 mana) public {
        require(isCharacter(id), "Mana is available only for character");
        require(hasRole(MANA_SETTER_ROLE, _msgSender()), "METARUNCOLLECTION: need MANA_SETTER_ROLE");
        tokenManaPoints[id] = mana;
    }

    function getSpeed(uint256 id) public view returns (uint256) {
        require(isCharacter(id), "Speed is available only for character");
        return tokenSpeedPoints[id];
    }

    function setSpeed(uint256 id, uint256 speed) public {
        require(isCharacter(id), "Speed is available only for character");
        require(hasRole(SPEED_SETTER_ROLE, _msgSender()), "METARUNCOLLECTION: need SPEED_SETTER_ROLE");
        tokenSpeedPoints[id] = speed;
    }

    function getCollisionDamage(uint256 id) public view returns (uint256) {
        require(isCharacter(id), "Collision Damage is available only for character");
        return tokenCollisionDamagePoints[id];
    }

    function setCollisionDamage(uint256 id, uint256 collisionDamage) public {
        require(isCharacter(id), "Collision Damage is available only for character");
        require(hasRole(COLLISION_DAMAGE_SETTER_ROLE, _msgSender()), "METARUNCOLLECTION: need COLLISION_DAMAGE_SETTER_ROLE");
        tokenCollisionDamagePoints[id] = collisionDamage;
    }
}
