pragma solidity ^0.8.1;
import "./TokenVestingMock.sol";

contract TokenVestingMockVested is TokenVestingMock {
    uint256 private dummyVestedAmount;

    constructor(address token) TokenVestingMock(token) {}

    function vestedAmount(address beneficiary) public override view returns(uint256) {
        return dummyVestedAmount;
    }

    function setVestedAmount(uint256 value) public {
        dummyVestedAmount = value;
    }
}
