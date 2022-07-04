// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "contracts/MetarunCollection.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract RunExecutor is Initializable, AccessControlUpgradeable {
    MetarunCollection public metarunCollection;
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    function initialize(address metarunCollectionAddress) public initializer {
        __AccessControl_init();
        metarunCollection = MetarunCollection(metarunCollectionAddress);
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(EXECUTOR_ROLE, _msgSender());
    }

    function isGameToken(uint256 tokenId) private view returns (bool) {
        bool isCharacter = metarunCollection.isCharacter(tokenId);
        bool isTicket = metarunCollection.isTicket(tokenId);
        return isCharacter || isTicket;
    }

    function executeRun(
        address winner,
        uint256 winnerOpal,
        uint256 winnerCharacterTokenId,
        address loser,
        uint256 loserOpal,
        uint256 loserCharacterTokenId
    ) public {
        require(hasRole(EXECUTOR_ROLE, _msgSender()), "RunExecutor: tx sender should have EXECUTOR_ROLE");
        if (winner != address(0)) {
            require(winnerOpal > 0, "RunExecutor: winner's opal to be minted should be defined");
            require(isGameToken(winnerCharacterTokenId), "RunExecutor: winner's token id should be character or ticket");
            require(metarunCollection.balanceOf(winner, winnerCharacterTokenId) == 1, "RunExecutor: winner should own winner character");
            metarunCollection.mint(winner, metarunCollection.OPAL_TOKEN_ID(), winnerOpal);
            MetarunCollection.Perks memory winnerCharacterPerks = metarunCollection.getPerks(winnerCharacterTokenId);
            winnerCharacterPerks.runs += 1;
            metarunCollection.setPerks(winnerCharacterTokenId, winnerCharacterPerks);
        }
        if (loser != 0x0000000000000000000000000000000000000000 && loserOpal > 0) {
            require(isGameToken(loserCharacterTokenId), "RunExecutor: loser's token id should be character or ticket");
            require(metarunCollection.balanceOf(loser, loserCharacterTokenId) == 1, "RunExecutor: loser should own loser character");
            metarunCollection.mint(loser, metarunCollection.OPAL_TOKEN_ID(), loserOpal);
            MetarunCollection.Perks memory loserCharacterPerks = metarunCollection.getPerks(loserCharacterTokenId);
            loserCharacterPerks.runs += 1;
            metarunCollection.setPerks(loserCharacterTokenId, loserCharacterPerks);
        }
    }
}
