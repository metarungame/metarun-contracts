// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

/**
 * @title Metarun ERC-1155 exchange
 * @dev Ensures the sale of tokens (exchanging them on Ether) by matching orders
 */

contract MetarunExchange is EIP712 {
    using SafeERC20Upgradeable for IERC20Upgradeable;
    IERC1155 public token;
    IERC20Upgradeable public mrunToken;
    mapping(bytes32 => bool) sellOrderPerformed;
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

    /**
     * @dev the constructor arguments:
     * @param _token address of token - the same used for playing
     * @param _mrunToken address of token - the same used for purchases
     */
    constructor(address _token, address _mrunToken) EIP712("metarun.game", "0.1") {
        require(_token != address(0), "token address cannot be zero");
        require(_mrunToken != address(0), "mrun address cannot be zero");
        token = IERC1155(_token);
        mrunToken = IERC20Upgradeable(_mrunToken);
    }

    // todo: SECURITY! make non-reentrant!
    function buy(SellOrder memory sellOrder, bytes memory signature) external payable {
        bytes32 sellOrderHash = hashSellOrder(sellOrder);
        address signer = ECDSA.recover(sellOrderHash, signature);
        require(signer != address(0), "BAD_SIGNATURE");
        require(signer == sellOrder.seller, "BAD SIGNER");
        require(msg.value == sellOrder.price, "BAD VALUE");
        require(!sellOrderPerformed[sellOrderHash], "ALREADY_DONE");
        require(block.timestamp < sellOrder.expirationTime, "EXPIRED");
        bytes32 orderHash = hashSellOrder(sellOrder);
        emit Purchase(orderHash, sellOrder.seller, msg.sender, sellOrder.tokenId, sellOrder.amount, sellOrder.price);
        token.safeTransferFrom(sellOrder.seller, msg.sender, sellOrder.tokenId, sellOrder.amount, "");
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
}
