//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./MetarunCollection.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/**
 * @title Mystery Box Sale
 * @dev Ensures purchase of mystery box
 */

contract MysteryBoxSale is AccessControlUpgradeable {
    MetarunCollection public collection;
    IERC20 public BUSD;

    // id that is supposed to be minted next
    uint256 public currentBoxId;
    // number of minted mystery boxes
    uint256 public currentBoxCount;
    uint256 public mysteryBoxKind;
    uint256 public mysteryBoxPrice;
    uint256 public constant maxBoxCount = 35175;

    event MysteryBoxBought(address owner, uint256 mysteryBoxId, bytes32 referrer);

    /**
     * @dev the constructor arguments:
     * @param _busd BUSD token - the same accepted to buy the mystery box
     * @param _collection ERC1155 token of NFT collection
     */

    function initialize(address _busd, address _collection) public initializer {
        __AccessControl_init();
        BUSD = IERC20(_busd);
        collection = MetarunCollection(_collection);
        mysteryBoxKind = collection.MYSTERY_BOX_KIND();
        currentBoxId = 0;
        currentBoxCount = 0;
        mysteryBoxPrice = 99990000000 gwei;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Buy mystery box
     * @param referrer purchase initializer
     */

    function buy(bytes32 referrer) external {
        currentBoxCount += 1;
        require(currentBoxCount <= maxBoxCount, "Max number of boxes purchased");
        uint256 mysteryBoxId = (mysteryBoxKind << 16) | currentBoxId;
        while (collection.exists(mysteryBoxId)) {
            mysteryBoxId += 1;
            currentBoxId += 1;
        }
        currentBoxId += 1;
        require(collection.isKind(mysteryBoxId, mysteryBoxKind), "KIND_OVERFLOW");
        BUSD.transferFrom(msg.sender, address(this), mysteryBoxPrice);
        collection.mint(msg.sender, mysteryBoxId, 1);

        emit MysteryBoxBought(msg.sender, mysteryBoxId, referrer);
    }

    /**
     * @dev Update mystery box price
     * @param value new price of mystery box
     */

    function setMysteryBoxPrice(uint256 value) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "You should have DEFAULT_ADMIN_ROLE");
        mysteryBoxPrice = value;
    }

    /**
     * @dev Send all BUSD tokens from the contract address to the recipient
     * @param payee recipient of funds
     */

    function withdrawPayments(address payee) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "You should have DEFAULT_ADMIN_ROLE");
        uint256 payment = BUSD.balanceOf(address(this));
        require(payment != 0, "Zero balance");
        BUSD.transfer(payee, payment);
    }
}
