// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

/**
 * @title Metarun ERC-1155 exchange
 * @dev Ensures the sale of tokens (exchanging them on Ether) by matching orders
 */
contract MetarunExchange {
    IERC1155 public token;

    struct SellOrder {
        // address of the current tokenholder
        address seller;
        // id of ERC-1155 token (kind)
        uint256 tokenId;
        // ERC155 amount of given Id user is going to sell
        uint256 amount;
        // the point at which order becomes outdated
        uint256 expirationTime;
        // price in wei (for entire amount of tokens)
        uint256 price;
        // random salt to prevent duplicate hashes
        uint256 salt;
    }

    constructor(address _token) {
        require(_token != address(0), "token address cannot be zero");
        token = IERC1155(_token);
    }

    // todo: SECURITY! make non-reentrant!
    function buy(SellOrder memory sellOrder) external payable {
        // check the order is actual (not traded already)
        // check the order is not expired and not too early
        // check the value matches order's price
        // withdraw NFTs from seller and transfer to buyer
        // send value to seller
    }
}
