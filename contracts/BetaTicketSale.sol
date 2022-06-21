//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./MetarunCollection.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";

contract BetaTicketSale is AccessControlUpgradeable, ERC1155HolderUpgradeable {
    MetarunCollection private collection;

    uint256 internal constant KIND_MASK = 0xffff0000;

    bytes32 public constant SETTER_ROLE = keccak256("SETTER_ROLE");

    mapping(uint256 => uint256[]) tickets;
    mapping(uint256 => uint256) ticketKindPrices;
    mapping(address => uint256) boughtTicketId;
    mapping(address => bool) vipList;
    uint256 internal availableVipTickets;

    event TicketBought(address owner, uint256 ticketId);

    function initialize(address _collection) public initializer {
        __AccessControl_init();
        __ERC1155Holder_init();
        collection = MetarunCollection(_collection);
        ticketKindPrices[collection.BRONZE_TICKET_KIND()] = 100 gwei;
        ticketKindPrices[collection.SILVER_TICKET_KIND()] = 200 gwei;
        ticketKindPrices[collection.GOLD_TICKET_KIND()] = 300 gwei;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SETTER_ROLE, msg.sender);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable, ERC1155ReceiverUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function buy(uint256 kind) external payable {
        require(isTicket(kind), "Provided kind should be ticket");
        require(msg.value == ticketKindPrices[kind], "Buyer should provide exactly the price of ticket");
        require(boughtTicketId[msg.sender] == 0, "Buyer should not buy a ticket before");
        uint256 ticketId = tickets[kind][tickets[kind].length - 1];
        if (vipList[msg.sender] == true) {
            availableVipTickets--;
        } else {
            uint256 ticketsAvailable = tickets[kind].length - availableVipTickets;
            require(ticketsAvailable > 0, "Not enough tickets on contract balance");
        }

        tickets[kind].pop();
        collection.safeTransferFrom(address(this), msg.sender, ticketId, 1, "");
        boughtTicketId[msg.sender] = ticketId;
        emit TicketBought(msg.sender, ticketId);
    }

    function isTicket(uint256 kind) internal view returns (bool) {
        return kind == collection.BRONZE_TICKET_KIND() || kind == collection.SILVER_TICKET_KIND() || kind == collection.GOLD_TICKET_KIND();
    }

    function setTicketKindPrice(uint256 kind, uint256 value) public {
        require(hasRole(SETTER_ROLE, msg.sender), "You should have SETTER_ROLE");
        ticketKindPrices[kind] = value;
    }

    function addTicket(uint256 id) internal {
        tickets[getKind(id)].push(id);
    }

    function addVip(address vip) public {
        require(hasRole(SETTER_ROLE, msg.sender), "You should have SETTER_ROLE");
        require(vipList[vip] == false, "Address already exists in the VIP list");
        vipList[vip] = true;
        availableVipTickets++;
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes memory data
    ) public virtual override returns (bytes4) {
        require(msg.sender == address(collection));
        if (isTicket(getKind(id))) {
            addTicket(id);
            return super.onERC1155Received(operator, from, id, value, data);
        } else return bytes4(0);
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) public virtual override returns (bytes4) {
        require(msg.sender == address(collection));
        for (uint256 i = 0; i < ids.length; i++) {
            if (isTicket(getKind(ids[i]))) {
                addTicket(ids[i]);
            } else return bytes4(0);
        }
        return super.onERC1155BatchReceived(operator, from, ids, values, data);
    }

    function getKind(uint256 id) public pure returns (uint256) {
        return (KIND_MASK & id) >> 16;
    }

    function getBoughtTicketId(address buyer) public view returns (uint256) {
        return boughtTicketId[buyer];
    }

    function getTicketKindPrice(uint256 kind) public view returns (uint256) {
        require(isTicket(kind), "Kind should be ticket");
        return ticketKindPrices[kind];
    }

    function getTicketsLeftByKind(uint256 kind, address user) public view returns (uint256) {
        require(isTicket(kind), "Kind should be ticket");
        uint256 ticketsAvailable;
        if (vipList[user] == true) {
            ticketsAvailable = tickets[kind].length;
        } else {
            ticketsAvailable = tickets[kind].length - availableVipTickets;
        }
        return ticketsAvailable;
    }
}
