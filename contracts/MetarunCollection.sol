// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract MetarunCollection is ERC1155Upgradeable, AccessControlUpgradeable {
    uint256 internal constant KIND_MASK = 0xffff0000;

    uint256 public constant CRAFTSMAN_CHARACTER_KIND = 0x0000;
    uint256 public constant FIGHTER_CHARACTER_KIND = 0x0001;
    uint256 public constant SPRINTER_CHARACTER_KIND = 0x0002;

    uint256 public constant ARTIFACT_TOKEN_KIND = 0x0100;
    uint256 public constant PET_TOKEN_KIND = 0x0200;
    uint256 public constant SKIN_TOKEN_KIND = 0x0300;

    uint256 public constant FUNGIBLE_TOKEN_KIND = 0x0500;
    uint256 public constant HEALTH_TOKEN_ID = (FUNGIBLE_TOKEN_KIND << 16) + 0x0000;
    uint256 public constant MANA_TOKEN_ID = (FUNGIBLE_TOKEN_KIND << 16) + 0x0001;
    uint256 public constant SPEED_TOKEN_ID = (FUNGIBLE_TOKEN_KIND << 16) + 0x0002;
    uint256 public constant COLLISION_DAMAGE_TOKEN_ID = (FUNGIBLE_TOKEN_KIND << 16) + 0x0003;

    mapping(uint256 => uint256) kindSupply;
    mapping(uint256 => uint256) tokenSupply;
    mapping(uint256 => uint256) tokenLevels;

    mapping(uint256 => uint256) tokenRuns;
    mapping(uint256 => uint256) tokenWins;

    mapping(uint256 => uint256) tokenAbilities;

    mapping(uint256 => uint256[4]) tokenPerks;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant SETTER_ROLE = keccak256("SETTER_ROLE");

    function initialize(string memory uri) public initializer {
        __ERC1155_init(uri);
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(SETTER_ROLE, _msgSender());
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function getKindSupply(uint256 kind) public view returns (uint256) {
        return kindSupply[kind];
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount
    ) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "METARUNCOLLECTION: need MINTER_ROLE");
        if (!isKind(id, FUNGIBLE_TOKEN_KIND)) {
            require(amount == 1, "Cannot mint more than one item");
            require(tokenSupply[id] == 0, "Cannot mint more than one item");
        }
        _mint(to, id, amount, "");
        kindSupply[getKind(id)]++;
        tokenSupply[id] += amount;
    }

    function mintBatch(
        address to,
        uint256 kind,
        uint256 count
    ) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "METARUNCOLLECTION: need MINTER_ROLE");
        require(!isKind(kind << 16, FUNGIBLE_TOKEN_KIND), "Mint many is available only for NFT");
        uint256[] memory tokenIds = new uint256[](count);
        uint256[] memory amounts = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            amounts[i] = 1;
        }
        uint256 initialTokenId = kindSupply[kind];
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = (kind << 16) | (initialTokenId + i);
            require(tokenSupply[tokenId] == 0, "Cannot mint more than one item");
            tokenIds[i] = tokenId;
        }

        _mintBatch(to, tokenIds, amounts, "");
        for (uint256 i = 0; i < count; i++) {
            tokenSupply[tokenIds[i]] = 1;
        }
        kindSupply[kind] += count;
    }

    function getTokenSupply(uint256 id) public view returns (uint256) {
        return tokenSupply[id];
    }

    function isCharacter(uint256 id) public pure returns (bool) {
        return isKind(id, CRAFTSMAN_CHARACTER_KIND) || isKind(id, FIGHTER_CHARACTER_KIND) || isKind(id, SPRINTER_CHARACTER_KIND);
    }

    function getKind(uint256 id) public pure returns (uint256) {
        return (KIND_MASK & id) >> 16;
    }

    function isKind(uint256 id, uint256 kind) public pure returns (bool) {
        return getKind(id) == kind;
    }

    function setURI(string memory newUri) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "need DEFAULT_ADMIN_ROLE");
        _setURI(newUri);
    }

    function getLevel(uint256 id) public view returns (uint256) {
        require(isCharacter(id) || isKind(id, PET_TOKEN_KIND), "Level is available only for pet or character");
        return tokenLevels[id];
    }

    function setLevel(uint256 id, uint256 level) public {
        require(isCharacter(id) || isKind(id, PET_TOKEN_KIND), "Level is available only for pet or character");
        require(hasRole(SETTER_ROLE, _msgSender()), "need SETTER_ROLE");
        tokenLevels[id] = level;
    }

    function getRunCount(uint256 id) external view returns (uint256) {
        require(isCharacter(id), "Runs count is available only for character");
        return tokenRuns[id];
    }

    function setRunCount(uint256 id, uint256 runsCount) public {
        require(isCharacter(id), "Runs count is available only for character");
        require(hasRole(SETTER_ROLE, _msgSender()), "need SETTER_ROLE");
        tokenRuns[id] = runsCount;
    }

    function getWinCount(uint256 id) external view returns (uint256) {
        require(isCharacter(id), "Wins count is available only for character");
        return tokenWins[id];
    }

    function setWinCount(uint256 id, uint256 winsCount) public {
        require(isCharacter(id), "Wins count is available only for character");
        require(hasRole(SETTER_ROLE, _msgSender()), "need SETTER_ROLE");
        tokenWins[id] = winsCount;
    }

    function getAbility(uint256 id) external view returns (uint256) {
        require(isCharacter(id), "Ability is available only for character");
        return tokenAbilities[id];
    }

    function setAbility(uint256 id, uint256 ability) public {
        require(isCharacter(id), "Ability is available only for character");
        require(hasRole(SETTER_ROLE, _msgSender()), "need SETTER_ROLE");
        tokenAbilities[id] = ability;
    }

    function getPerks(uint256 id) external view returns (uint256[4] memory) {
        require(isCharacter(id), "Health is available only for character");
        return tokenPerks[id];
    }

    function setPerks(uint256 id, uint256[4] memory perks) public {
        require(isCharacter(id), "Health is available only for character");
        require(hasRole(SETTER_ROLE, _msgSender()), "need SETTER_ROLE");
        tokenPerks[id] = perks;
    }

    function increaseHealth(uint256 amount, uint256 characterId) external {
        require(isCharacter(characterId), "Does not match token character kind");
        require(balanceOf(msg.sender, characterId) == 1, "Not enough character token balance");
        require(balanceOf(msg.sender, HEALTH_TOKEN_ID) >= amount, "Not enough health token balance");
        _burn(msg.sender, HEALTH_TOKEN_ID, amount);
        tokenPerks[characterId][0] += amount;
    }

    function decreaseHealth(uint256 amount, uint256 characterId) external {
        require(isCharacter(characterId), "Does not match token character kind");
        require(balanceOf(msg.sender, characterId) == 1, "Not enough character token balance");
        require(tokenPerks[characterId][0] >= amount, "Not enough health points");
        tokenPerks[characterId][0] -= amount;
        _mint(msg.sender, HEALTH_TOKEN_ID, amount, "");
    }
}
