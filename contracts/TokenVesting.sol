// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


/**
 * @title TokenVesting
 * @dev A token holder contract that can release its token balance gradually like a
 * typical vesting scheme, with a cliff and vesting period. Optionally revocable by the
 * owner.
 */
contract TokenVesting is Context, ReentrancyGuard  {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event Released(uint256 amount);

    IERC20 private _token;

    struct Vesting {
        uint256 start;
        uint256 interval;
        uint256 duration;
        uint256 balance;
        uint256 released;
    }

    mapping (address => Vesting) private _vestings;

    constructor (address token) {
        require(token != address(0), "token address cannot be zero");
        _token = IERC20(token);
    }

    function _getCurrentBlockTime() internal virtual view returns (uint256) {
        return block.timestamp;
    }

    function getVesting(address beneficiary) public view returns (uint256, uint256, uint256, uint256, uint256) {
        Vesting memory v = _vestings[beneficiary];
        return (v.start, v.interval, v.duration, v.balance, v.released);
    }

    function createVesting(
        address beneficiary,
        uint256 start,
        uint256 interval,
        uint256 duration,
        uint256 amount
    ) external nonReentrant {
        require(interval > 0 , "TokenVesting #createVesting: interval must be greater than 0");
        require(duration >= interval, "TokenVesting #createVesting: interval cannot be bigger than duration");

        Vesting storage vest = _vestings[beneficiary];
        require(vest.balance == 0, "TokenVesting #createVesting: vesting for beneficiary already created");

        _token.safeTransferFrom(_msgSender(), address(this), amount);

        vest.start = start;
        vest.interval = interval;
        vest.duration = duration;
        vest.balance = amount;
        vest.released = uint256(0);
    }

    function postponeVesting(uint256 start) external {
        Vesting storage vest = _vestings[_msgSender()];
        require(vest.balance != 0, "TokenVesting #postponeVesting: vesting for beneficiary does not exist");
        require(vest.start < start, "TokenVesting #postponeVesting: new start date cannot be earlier than original start date");
        vest.start = start;
    }

    function release(address beneficiary) external nonReentrant {
        uint256 unreleased = releasableAmount(beneficiary);
        require(unreleased > 0, "TokenVesting #release: nothing to release");

        Vesting storage vest = _vestings[beneficiary];

        vest.released = vest.released.add(unreleased);
        vest.balance = vest.balance.sub(unreleased);

        _token.safeTransfer(beneficiary, unreleased);
        emit Released(unreleased);
    }

    function releasableAmount(address beneficiary) public view returns (uint256) {
        return vestedAmount(beneficiary).sub(_vestings[beneficiary].released);
    }

    function vestedAmount(address beneficiary) public view returns (uint256) {
        Vesting memory vest = _vestings[beneficiary];
        if (_getCurrentBlockTime() < vest.start) {
            return 0;
        }
        uint256 currentBalance = vest.balance;
        uint256 totalBalance = currentBalance.add(vest.released);

        if (_getCurrentBlockTime() >= vest.start.add(vest.duration)) {
            return totalBalance;
        } else {
            uint256 numberOfInvervals = _getCurrentBlockTime().sub(vest.start).div(vest.interval);
            uint256 totalIntervals = vest.duration.div(vest.interval);
            return totalBalance.mul(numberOfInvervals).div(totalIntervals);
        }
    }
}
