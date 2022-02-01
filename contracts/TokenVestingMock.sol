// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


/**
 * @title TokenVestingMock
 * @dev Mock extenstion for parent contract fro work with date
 */

contract TokenVestingMock is TokenVesting {
    uint256 private currentTime;
    using SafeMath for uint256;

    constructor(
        address token
    ) TokenVesting(token) {}

    function setCurrentTime(uint256 _currentTime) public {
        currentTime = _currentTime;
    }

    function decreaseCurrentTime(uint256 _timeDelta) public {
        currentTime = _currentTime.sub(_timeDelta);
    }

    function increaseCurrentTime(uint256 _timeDelta) public {
        currentTime = currentTime.add(_timeDelta);
    }

    function now() public returns (uint256) {
        return currentTime;
    }
}
