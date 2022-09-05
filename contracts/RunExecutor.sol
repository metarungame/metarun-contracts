// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "contracts/MetarunCollection.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract RunExecutor is Initializable, AccessControlUpgradeable {
    MetarunCollection public metarunCollection;
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    struct RunnerInfo {
        address adds;
        uint256 opal;
        uint256 tokenId;
    }

    function initialize(address metarunCollectionAddress) public initializer {
        __AccessControl_init();
        require(metarunCollectionAddress != address(0), "RunExecutor: ZERO_COLLECTION_ADDR");
        metarunCollection = MetarunCollection(metarunCollectionAddress);
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(EXECUTOR_ROLE, _msgSender());
    }

    function executeRun(
        RunnerInfo memory winnerInfo,
        MetarunCollection.Perks memory winnerPerks,
        RunnerInfo memory loserInfo,
        MetarunCollection.Perks memory loserPerks
    ) public {
        require(hasRole(EXECUTOR_ROLE, _msgSender()), "RunExecutor: tx sender should have EXECUTOR_ROLE");
        if (winnerInfo.adds != address(0)) {
            require(winnerInfo.opal > 0, "RunExecutor: winner's opal to be minted should be defined");
            handleRunParticipant(winnerInfo, winnerPerks);
        }
        if (loserInfo.adds != address(0) && loserInfo.opal > 0) {
            handleRunParticipant(loserInfo, loserPerks);
        }
    }

    function executeThreeParticipantsRun(
        RunnerInfo memory winnerInfo,
        MetarunCollection.Perks memory winnerPerks,
        RunnerInfo memory secondInfo,
        MetarunCollection.Perks memory secondPerks,
        RunnerInfo memory loserInfo,
        MetarunCollection.Perks memory loserPerks
    ) public {
        require(hasRole(EXECUTOR_ROLE, _msgSender()), "RunExecutor: tx sender should have EXECUTOR_ROLE");
        if (winnerInfo.adds != address(0)) {
            require(winnerInfo.opal > 0, "RunExecutor: winner's opal to be minted should be defined");
            handleRunParticipant(winnerInfo, winnerPerks);
        }
        if (secondInfo.adds != address(0) && secondInfo.opal > 0) {
            handleRunParticipant(secondInfo, secondPerks);
        }
        if (loserInfo.adds != address(0) && loserInfo.opal > 0) {
            handleRunParticipant(loserInfo, loserPerks);
        }
    }

    function handleRunParticipant(RunnerInfo memory participantInfo, MetarunCollection.Perks memory perks) internal {
        require(participantInfo.adds != address(0), "RunExecutor: ZERO_REWARDEE");
        require(metarunCollection.isGameToken(participantInfo.tokenId), "RunExecutor: participant's token id should be game token");
        require(
            metarunCollection.balanceOf(participantInfo.adds, participantInfo.tokenId) == 1,
            "RunExecutor: participant should own its character"
        );
        metarunCollection.mint(participantInfo.adds, metarunCollection.OPAL_TOKEN_ID(), participantInfo.opal);
        metarunCollection.setPerks(participantInfo.tokenId, perks);
    }
}
