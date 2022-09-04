// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

/**
 * @title Metarun ERC-1155 exchange
 * @dev Ensures the sale of tokens (exchanging them on Ether) by matching orders
 */

contract MetarunExchange is EIP712Upgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;
    IERC1155Upgradeable public collection;
    IERC20Upgradeable public mrunToken;
    mapping(bytes32 => bool) sellOrderPerformed;
    mapping(bytes32 => bool) sellOrderCancelled;
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
    event Purchase(bytes32 indexed orderHash, address indexed seller, address indexed buyer, uint256 tokenId, uint256 amount, uint256 price);

    event Cancel(bytes32 indexed orderHash, uint256 timestamp);

    /**
     * @dev the constructor arguments:
     * @param _collection address of collection - the same used for playing
     * @param _mrunToken address of token - the same used for purchases
     */
    function initialize(address _collection, address _mrunToken) public initializer {
        __EIP712_init("metarun.game", "0.1");
        require(_collection != address(0), "collection address cannot be zero");
        require(_mrunToken != address(0), "mrun address cannot be zero");
        collection = IERC1155Upgradeable(_collection);
        mrunToken = IERC20Upgradeable(_mrunToken);
    }

    // todo: SECURITY! make non-reentrant!
    function buy(SellOrder memory sellOrder, bytes memory signature) external {
        bytes32 sellOrderHash = hashSellOrder(sellOrder);
        address signer = ECDSAUpgradeable.recover(sellOrderHash, signature);
        require(signer != address(0), "BAD_SIGNATURE");
        require(signer == sellOrder.seller, "BAD SIGNER");
        require(!sellOrderPerformed[sellOrderHash], "ALREADY_DONE");
        require(!sellOrderCancelled[sellOrderHash], "ALREADY_CANCELLED");
        require(block.timestamp < sellOrder.expirationTime, "EXPIRED");
        bytes32 orderHash = hashSellOrder(sellOrder);
        emit Purchase(orderHash, sellOrder.seller, msg.sender, sellOrder.tokenId, sellOrder.amount, sellOrder.price);
        collection.safeTransferFrom(sellOrder.seller, msg.sender, sellOrder.tokenId, sellOrder.amount, "");
        mrunToken.safeTransferFrom(msg.sender, sellOrder.seller, sellOrder.price);
        sellOrderPerformed[sellOrderHash] = true;
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

    function cancel(SellOrder memory sellOrder, bytes memory signature) external {
        bytes32 hash = hashSellOrder(sellOrder);
        address signer = ECDSAUpgradeable.recover(hash, signature);
        require(!sellOrderCancelled[hash], "ALREADY_CANCELLED");
        require(!sellOrderPerformed[hash], "ALREADY_DONE");
        require(signer == msg.sender, "BAD_SENDER");
        sellOrderCancelled[hash] = true;
        emit Cancel(hash, block.timestamp);
    }
}
