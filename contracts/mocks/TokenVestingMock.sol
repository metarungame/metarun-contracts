pragma solidity ^0.8.0;

import "../TokenVesting.sol";

contract TokenVestingMock is TokenVesting {
    uint256 private currentBlockTime;

    constructor(address token) TokenVesting(token) {}

    function setCurrentBlockTime(uint256 _currentBlockTime) public {
        currentBlockTime = _currentBlockTime;
    }

    function _getCurrentBlockTime() internal override view returns (uint256) {
        return currentBlockTime;
    }

    function getCurrentBlockTime() public view returns (uint256) {
        return _getCurrentBlockTime();
    }

}
