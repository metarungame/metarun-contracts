// SPDX-License-Identifier: MIT

pragma solidity ^0.8.1;

import "contracts/MetarunCollection.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract RunExecutor is Initializable, OwnableUpgradeable {
    struct Run {
        address winner;
        address looser;
        uint256 winnerCharacterTokenId;
        uint256 looserCharacterTokenId;
        uint256 winnerOpal;
        uint256 looserOpal;
        uint256 winnerExperience;
    }

    MetarunCollection _metarunCollection;

    function initialize(address metarunCollectionAddress) public initializer {
        __Ownable_init();
        _metarunCollection = MetarunCollection(metarunCollectionAddress);
    }

    function executeRun(Run memory run) public onlyOwner {
        require(run.winnerOpal > 0, "RunExecutor: winner's opal to be minted should be defined");
        require(_metarunCollection.isCharacter(run.winnerCharacterTokenId), "RunExecutor: winner's character token id should be valid");
        require(_metarunCollection.isCharacter(run.looserCharacterTokenId), "RunExecutor: looser's character token id should be valid");
        _metarunCollection.mint(run.winner, _metarunCollection.OPAL_TOKEN_ID(), run.winnerOpal);
        if (run.looserOpal > 0) {
            _metarunCollection.mint(run.looser, _metarunCollection.OPAL_TOKEN_ID(), run.looserOpal);
        }
        if (run.winnerExperience > 0) {
            MetarunCollection.Perks memory winnerCharacterPerks = _metarunCollection.getPerks(run.winnerCharacterTokenId);
            winnerCharacterPerks.level += run.winnerExperience;
            _metarunCollection.setPerks(run.winnerCharacterTokenId, winnerCharacterPerks);
        }
    }
}
