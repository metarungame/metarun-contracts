// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MetarunCollection is ERC1155, AccessControl {
    uint256 public constant CHARACTER = 0;
    uint256 public constant PET = 1;
    uint256 public constant ARTIFACT = 2;
    uint256 public constant SKIN = 3;

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
        _mint(to, id, amount, "");
    }

    function setURI(string memory newUri) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "METARUNCOLLECTION: need DEFAULT_ADMIN_ROLE");
        _setURI(newUri);
    }
}