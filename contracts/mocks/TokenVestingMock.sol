pragma solidity ^0.8.0;

import "../TokenVesting.sol";

contract TokenVestingMock is TokenVesting {
    uint256 private currentBlockTime;

    constructor(
        address _token,
        uint256 _lockBps,
        uint256 _vestBps,
        uint256 _lockClaimTime,
        uint256 _vestStart,
        uint256 _vestDuration,
        uint256 _vestInterval
    ) TokenVesting(_token, _lockBps, _vestBps, _lockClaimTime, _vestStart, _vestDuration, _vestInterval) {}

    function setLockBps(uint256 _lockBps) public {
        lockBps = _lockBps;
    }

    function setVestBps(uint256 _vestBps) public {
        vestBps = _vestBps;
    }

    function setReleased(address _beneficiary, uint256 _released) public {
        allocations[_beneficiary].released = _released;
    }

    function setCurrentBlockTime(uint256 _currentBlockTime) public {
        currentBlockTime = _currentBlockTime;
    }

    function _getCurrentBlockTime() internal view override returns (uint256) {
        return currentBlockTime;
    }

    function getCurrentBlockTime() public view returns (uint256) {
        return _getCurrentBlockTime();
    }
}
