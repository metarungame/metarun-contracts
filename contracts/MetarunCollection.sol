// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MetarunCollection is ERC1155 {

    uint256 public constant FIRST_TOKEN = 0;
    uint256 public constant SECOND_TOKEN = 1;

    uint256 public constant TWO_INSTANCE_TOKEN = 2;

    constructor(string memory uri) ERC1155(uri) {
        _mint(msg.sender, FIRST_TOKEN, 1, "");
        _mint(msg.sender, SECOND_TOKEN, 1, "");
        _mint(msg.sender, TWO_INSTANCE_TOKEN, 1, "");
        _mint(msg.sender, TWO_INSTANCE_TOKEN, 1, "");
    }
    
}
