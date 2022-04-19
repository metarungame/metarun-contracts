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

    mapping(uint256 => address) tokenOwners;
    mapping(uint256 => mapping(address => uint256)) tokenBalances;
    mapping(uint256 => uint256) tokenLevels;

    mapping(uint256 => uint256) tokenRuns;
    mapping(uint256 => uint256) tokenWins;

    mapping(uint256 => uint256) tokenAbilities;

    mapping(uint256 => uint256) tokenHealthPoints;
    mapping(uint256 => uint256) tokenManaPoints;
    mapping(uint256 => uint256) tokenSpeedPoints;
    mapping(uint256 => uint256) tokenCollisionDamagePoints;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(string memory uri) ERC1155(uri) {
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
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
        if (isFungible(id)) {
            _mint(to, id, amount, "");
            tokenBalances[id][to] += amount;
        } else {
            require(tokenOwners[id] == address(0), "Cannot mint more than one item");
            require(amount == 1, "Cannot mint more than one item");
            tokenOwners[id] = to;
            _mint(to, id, amount, "");
        }
    }

    function balanceOf(address account, uint256 id) public view override returns (uint256) {
        if (isFungible(id)) {
            return tokenBalances[id][account];
        } else {
            if (tokenOwners[id] == account) {
                return 1;
            } else return 0;
        }
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        if (!isFungible(id)) {
            require(amount == 1, "For transfer of non-fungible amount should be 1");
            require(tokenOwners[id] == from, "Transfer sender should be owner of token with this id");
        }
        super.safeTransferFrom(from, to, id, amount, data);
        if (isFungible(id)) {
            tokenBalances[id][to] += amount;
            tokenBalances[id][from] -= amount;
        } else {
            tokenOwners[id] = to;
        }
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

    function setURI(string memory newUri) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "METARUNCOLLECTION: need DEFAULT_ADMIN_ROLE");
        _setURI(newUri);
    }
}
