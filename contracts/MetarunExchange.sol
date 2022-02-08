// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

/**
 * @title Metarun ERC-1155 exchange
 * @dev Ensures the sale of tokens (exchanging them on Ether) by matching orders
 */
contract MetarunExchange {
    IERC1155 public token;

    constructor(address _token) {
        require(_token != address(0), "token address cannot be zero");
        token = IERC1155(_token);
    }
}
