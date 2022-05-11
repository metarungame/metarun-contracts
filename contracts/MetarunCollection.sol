// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract MetarunCollection is ERC1155Upgradeable, AccessControlUpgradeable, ERC1155BurnableUpgradeable, ERC1155SupplyUpgradeable {
    uint256 internal constant KIND_MASK = 0xffff0000;

    uint256 public constant CRAFTSMAN_CHARACTER_KIND = 0x0000;
    uint256 public constant FIGHTER_CHARACTER_KIND = 0x0001;
    uint256 public constant SPRINTER_CHARACTER_KIND = 0x0002;

    uint256 public constant ARTIFACT_TOKEN_KIND = 0x0100;
    uint256 public constant PET_TOKEN_KIND = 0x0200;

    uint256 public constant COMMON_SKIN_KIND = 0x0300;
    uint256 public constant RARE_SKIN_KIND = 0x0301;
    uint256 public constant MYTHICAL_SKIN_KIND = 0x0302;

    uint256 public constant FUNGIBLE_TOKEN_KIND = 0x0500;
    uint256 public constant HEALTH_TOKEN_ID = (FUNGIBLE_TOKEN_KIND << 16) + 0x0000;
    uint256 public constant MANA_TOKEN_ID = (FUNGIBLE_TOKEN_KIND << 16) + 0x0001;
    uint256 public constant SPEED_TOKEN_ID = (FUNGIBLE_TOKEN_KIND << 16) + 0x0002;
    uint256 public constant COLLISION_DAMAGE_TOKEN_ID = (FUNGIBLE_TOKEN_KIND << 16) + 0x0003;
    uint256 public constant OPAL_TOKEN_ID = (FUNGIBLE_TOKEN_KIND << 16) + 0x0004;

    mapping(uint256 => uint256) kindSupply;
    struct Perks {
        uint256 level;
        uint256 runs;
        uint256 wins;
        uint256 ability;
        uint256 health;
        uint256 mana;
        uint256 speed;
        uint256 collisionDamage;
    }

    mapping(uint256 => Perks) tokenPerks;

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

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155Upgradeable, ERC1155SupplyUpgradeable) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
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
            require(!exists(id), "Cannot mint more than one item");
        }
        _mint(to, id, amount, "");
        kindSupply[getKind(id)]++;
    }

    function mintBatch(
        address to,
        uint256 kind,
        uint256 count
    ) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "NEED_MINTER_ROLE");
        require(kind != FUNGIBLE_TOKEN_KIND, "UNSUITABLE_KIND");
        require(count > 0, "COUNT_UNDERFLOW");
        uint256[] memory tokenIds = new uint256[](count);
        uint256 countOfReadyToMintIds = 0;
        uint256 currentTokenId = kind << 16;
        while (countOfReadyToMintIds < count) {
            require(isKind(currentTokenId, kind), "KIND_OVERFLOW");
            if (!exists(currentTokenId)) {
                tokenIds[countOfReadyToMintIds] = currentTokenId;
                countOfReadyToMintIds++;
            }
            currentTokenId++;
        }
        uint256[] memory amounts = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            amounts[i] = 1;
        }

        _mintBatch(to, tokenIds, amounts, "");
        kindSupply[kind] += count;
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

    function getPerks(uint256 id) external view returns (Perks memory) {
        require(isCharacter(id) || isKind(id, PET_TOKEN_KIND), "Perks are available only for characters and pets");
        return tokenPerks[id];
    }

    function setPerks(uint256 id, Perks memory perks) public {
        require(isCharacter(id) || isKind(id, PET_TOKEN_KIND), "Perks are available only for characters and pets");
        require(hasRole(SETTER_ROLE, _msgSender()), "need SETTER_ROLE");
        tokenPerks[id] = perks;
    }
}
