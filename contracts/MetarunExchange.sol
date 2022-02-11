// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

/**
 * @title Metarun ERC-1155 exchange
 * @dev Ensures the sale of tokens (exchanging them on Ether) by matching orders
 */
contract MetarunExchange is EIP712 {
    IERC1155 public token;

    struct SellOrder {
        // address of the current tokenholder
        address payable seller;
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

    /**
     * @dev Gets emitted on token purchase
     */
    event Purchase(
        bytes32 indexed orderHash,
        address indexed seller,
        address indexed buyer,
        uint256 tokenId,
        uint256 amount,
        uint256 price
    );

    constructor(address _token) EIP712("metarun.game", "0.1") {
        require(_token != address(0), "token address cannot be zero");
        token = IERC1155(_token);
    }

    // todo: SECURITY! make non-reentrant!
    function buy(SellOrder memory sellOrder, bytes memory signature) external payable {
        bytes32 sellOrderHash = hashSellOrder(sellOrder);
        address signer = ECDSA.recover(sellOrderHash, signature);
        require(signer != address(0), "BAD_SIGNATURE");
        require(signer == sellOrder.seller, "BAD SIGNER");
        require(msg.value == sellOrder.price, "BAD VALUE");
        // check the order is actual (not traded already)
        // check the order is not expired and not too early
        bytes32 orderHash = hashSellOrder(sellOrder);
        emit Purchase(orderHash, sellOrder.seller, msg.sender, sellOrder.tokenId, sellOrder.amount, sellOrder.price);
        token.safeTransferFrom(sellOrder.seller, msg.sender, sellOrder.tokenId, sellOrder.amount, "");
        sellOrder.seller.transfer(msg.value);
    }

    // Returns the hash of the fully encoded EIP712 SellOrder for this domain.
    // todo: made public for debugging reasons.
    // Need to make it internal to optimize gas consumption
    function hashSellOrder(SellOrder memory sellOrder) public view returns (bytes32) {
        bytes32 sellOrderTypeHash = keccak256(
            "SellOrder(address seller,uint256 tokenId,uint256 amount,uint256 expirationTime,uint256 price,uint256 salt)"
        );
        bytes32 orderHash = keccak256(
            abi.encode(
                sellOrderTypeHash,
                sellOrder.seller,
                sellOrder.tokenId,
                sellOrder.amount,
                sellOrder.expirationTime,
                sellOrder.price,
                sellOrder.salt
            )
        );
        return (_hashTypedDataV4(orderHash));
    }
}
