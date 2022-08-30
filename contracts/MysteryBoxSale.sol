//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./MetarunCollection.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract MysteryBoxSale is AccessControlUpgradeable {
    MetarunCollection private collection;
    ERC20 private BUSD;

    bytes32 public constant SETTER_ROLE = keccak256("SETTER_ROLE");

    uint256 public currentBoxId;
    uint256 public currentBoxCount;
    uint256 public mysteryBoxKind;
    uint256 public mysteryBoxPrice;
    uint256 public constant maxBoxCount = 35175;

    event MysteryBoxBought(address owner, uint256 mysteryBoxId, string referrer);

    function initialize(address _busd, address _collection) public initializer {
        __AccessControl_init();
        BUSD = ERC20(_busd);
        collection = MetarunCollection(_collection);
        mysteryBoxKind = collection.MYSTERY_BOX_KIND();
        currentBoxId = 0;
        currentBoxCount = 0;
        mysteryBoxPrice = 99990000000 gwei;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SETTER_ROLE, msg.sender);
    }

    function buy(string memory referrer) external {
        currentBoxCount += 1;
        require(currentBoxCount <= maxBoxCount, "Max number of boxes purchased");
        uint256 mysteryBoxId = (mysteryBoxKind << 16) | currentBoxId;
        while (collection.exists(currentBoxId)) {
            mysteryBoxId += 1;
            currentBoxId += 1;
        }
        currentBoxId += 1;
        require(collection.isKind(mysteryBoxId, mysteryBoxKind), "KIND_OVERFLOW");
        BUSD.transferFrom(msg.sender, address(this), mysteryBoxPrice);
        collection.mint(msg.sender, mysteryBoxId, 1);

        emit MysteryBoxBought(msg.sender, mysteryBoxId, referrer);
    }

    function setTicketKindPrice(uint256 value) public {
        require(hasRole(SETTER_ROLE, msg.sender), "You should have SETTER_ROLE");
        mysteryBoxPrice = value;
    }

    function withdrawPayments(address payee) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "You should have DEFAULT_ADMIN_ROLE");
        uint256 payment = BUSD.balanceOf(address(this));
        require(payment != 0, "Zero balance");
        BUSD.transfer(payee, payment);
    }
}
