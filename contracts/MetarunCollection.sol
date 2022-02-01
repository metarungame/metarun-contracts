// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MetarunCollection is ERC1155, AccessControl {
    uint256 public constant FIRST_TOKEN = 0;
    uint256 public constant SECOND_TOKEN = 1;

    uint256 public constant TWO_INSTANCE_TOKEN = 2;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor(string memory uri) ERC1155(uri) {
        _mint(msg.sender, FIRST_TOKEN, 1, "");
        _mint(msg.sender, SECOND_TOKEN, 1, "");
        _mint(msg.sender, TWO_INSTANCE_TOKEN, 1, "");
        _mint(msg.sender, TWO_INSTANCE_TOKEN, 1, "");

        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns(bool) {
        return super.supportsInterface(interfaceId);
    }

    function mint(address to, uint256 id, uint256 amount) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "METARUNCOLLECTION: need MINTER_ROLE");
        _mint(to, id, amount, "");
    }

    function changeUri(string memory newUri) public {
        require(hasRole(ADMIN_ROLE, _msgSender()), "METARUNCOLLECTION: need ADMIN_ROLE");
        _setURI(newUri);
    }
}
