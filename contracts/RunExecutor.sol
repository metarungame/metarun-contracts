// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "contracts/MetarunCollection.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract RunExecutor is Initializable, AccessControlUpgradeable {
    struct Run {
        address winner;
        address looser;
        uint256 winnerCharacterTokenId;
        uint256 looserCharacterTokenId;
        uint256 winnerOpal;
        uint256 looserOpal;
        uint256 winnerExperience;
    }

    MetarunCollection public metarunCollection;
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    function initialize(address metarunCollectionAddress) public initializer {
        __AccessControl_init();
        metarunCollection = MetarunCollection(metarunCollectionAddress);
        _grantRole(EXECUTOR_ROLE, _msgSender());
    }

    function executeRun(Run memory run) public {
        require(hasRole(EXECUTOR_ROLE, _msgSender()), "RunExecutor: tx sender should have EXECUTOR_ROLE");
        require(run.winnerOpal > 0, "RunExecutor: winner's opal to be minted should be defined");
        require(metarunCollection.isCharacter(run.winnerCharacterTokenId), "RunExecutor: winner's character token id should be valid");
        require(metarunCollection.isCharacter(run.looserCharacterTokenId), "RunExecutor: looser's character token id should be valid");
        require(metarunCollection.balanceOf(run.winner, run.winnerCharacterTokenId) == 1, "RunExecutor: winner should own winner character");
        require(metarunCollection.balanceOf(run.looser, run.looserCharacterTokenId) == 1, "RunExecutor: looser should own looser character");

        metarunCollection.mint(run.winner, metarunCollection.OPAL_TOKEN_ID(), run.winnerOpal);
        if (run.looserOpal > 0) {
            metarunCollection.mint(run.looser, metarunCollection.OPAL_TOKEN_ID(), run.looserOpal);
        }
        if (run.winnerExperience > 0) {
            MetarunCollection.Perks memory winnerCharacterPerks = metarunCollection.getPerks(run.winnerCharacterTokenId);
            winnerCharacterPerks.level += run.winnerExperience;
            metarunCollection.setPerks(run.winnerCharacterTokenId, winnerCharacterPerks);
        }
    }
}
