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
            handleRunParticipant(winner, winnerOpal, winnerCharacterTokenId);
        }
        if (loser != address(0) && loserOpal > 0) {
            handleRunParticipant(loser, loserOpal, loserCharacterTokenId);
        }
    }

    function executeThreeParticipantsRun(
        address winner,
        uint256 winnerOpal,
        uint256 winnerCharacterTokenId,
        address second,
        uint256 secondOpal,
        uint256 secondCharacterTokenId,
        address loser,
        uint256 loserOpal,
        uint256 loserCharacterTokenId
    ) public {
        require(hasRole(EXECUTOR_ROLE, _msgSender()), "RunExecutor: tx sender should have EXECUTOR_ROLE");
        if (winner != address(0)) {
            require(winnerOpal > 0, "RunExecutor: winner's opal to be minted should be defined");
            handleRunParticipant(winner, winnerOpal, winnerCharacterTokenId);
        }
        if (second != address(0) && secondOpal > 0) {
            handleRunParticipant(second, secondOpal, secondCharacterTokenId);
        }
        if (loser != address(0) && loserOpal > 0) {
            handleRunParticipant(loser, loserOpal, loserCharacterTokenId);
        }
    }

    function handleRunParticipant(
        address participant,
        uint256 opal,
        uint256 characterTokenId
    ) internal {
        require(metarunCollection.isGameToken(characterTokenId), "RunExecutor: participant's token id should be game token");
        require(metarunCollection.balanceOf(participant, characterTokenId) == 1, "RunExecutor: participant should own its character");
        metarunCollection.mint(participant, metarunCollection.OPAL_TOKEN_ID(), opal);
        MetarunCollection.Perks memory perks = metarunCollection.getPerks(characterTokenId);
        perks.runs += 1;
        metarunCollection.setPerks(characterTokenId, perks);
    }
}
