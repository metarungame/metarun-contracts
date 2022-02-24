pragma solidity ^0.8.1;
import "./TokenVestingMock.sol";

contract TokenVestingMockReleasable is TokenVestingMock {
    uint256 private dummyReleasableAmount;

    constructor(address token) TokenVestingMock(token) {}

    function releasableAmount(address beneficiary) public view virtual override returns (uint256) {
        return dummyReleasableAmount;
    }

    function setReleasableAmount(uint256 value) public {
        dummyReleasableAmount = value;
    }

}
