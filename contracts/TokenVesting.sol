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
contract TokenVesting is Context, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event Released(uint256 amount);

    IERC20 private _token;

    /**
        @notice Vesting consists of 6 fields
        Starting moment (UNIX timestamp)
        Cliff moment before which release is impossible
        Time period during which beneficiary can get tokens 
        Total timespan of vesting 
        Amount of tokens dedicated to vesting's beneficiary but not sent
        Already released amount of tokens (they are aleady owned by beneficiary)

        Duration is comprised of periods with length stored in interval field.
        Total count of intervals = to duration / interval.
        Intervals are used to indicate how much time passed since vesting has started.
        This indication can help us to calculate vested amount of tokens.
        These calculations are in function vestedAmount()
     */
    struct Vesting {
        uint256 start;
        uint256 cliff;
        uint256 interval;
        uint256 duration;
        uint256 balance;
        uint256 released;
    }

    mapping(address => Vesting) private _vestings;

    constructor (address token) {
        require(token != address(0), "token address cannot be zero");
        _token = IERC20(token);
    }

    /**
        @notice Gives timestamp for current moment of time
        @return UNIX timestamp of current block
     */
    function _getCurrentBlockTime() internal virtual view returns (uint256) {
        return block.timestamp;
    }

    /**
        @notice Getter for vesting struct
        @param beneficiary vesting holder
        @return start
        @return cliff
        @return interval
        @return duration
        @return balance
        @return released
     */
    function getVesting(address beneficiary) public view returns (uint256, uint256, uint256, uint256, uint256, uint256) {
        Vesting memory v = _vestings[beneficiary];
        return (v.start, v.cliff, v.interval, v.duration, v.balance, v.released);
    }

    /**
        @notice Create a new vesting for beneficiary. If there's already one, creating will be rejected
        @param beneficiary vesting holder
        @param start timestamp when vesting is started
        @param cliff timestamp before which it is impossible to accrue tokens
        @param interval number of seconds comprising an interval of vesting.
        @param duration whole period of vesting. started + duration is the moment when vesting is finished
        @param amount how much tokens should be vested
     */
    function createVesting(
        address beneficiary,
        uint256 start,
        uint256 cliff,
        uint256 interval,
        uint256 duration,
        uint256 amount
    ) external nonReentrant {
        require(interval > 0, "TokenVesting #createVesting: interval must be greater than 0");
        require(duration >= interval, "TokenVesting #createVesting: interval cannot be bigger than duration");
        require(cliff >= start, "TokenVesting #createVesting: cliff must be greater or equal to start");
        require(start + duration > cliff, "TokenVesting #createVesting: cliff exceeds duration");

        Vesting storage vest = _vestings[beneficiary];
        require(vest.balance == 0, "TokenVesting #createVesting: vesting for beneficiary already created");

        _token.safeTransferFrom(_msgSender(), address(this), amount);

        vest.start = start;
        vest.cliff = cliff;
        vest.interval = interval;
        vest.duration = duration;
        vest.balance = amount;
        vest.released = uint256(0);
    }

    /**
        @notice Release (i.e. send) vested tokens to beneficiary
        @param beneficiary owner of tokens
     */
    function release(address beneficiary) external nonReentrant {
        uint256 unreleased = releasableAmount(beneficiary);
        require(unreleased > 0, "TokenVesting #release: nothing to release");

        Vesting storage vest = _vestings[beneficiary];
        require(_getCurrentBlockTime() >= vest.cliff, "TokenVesting #release: before cliff date");

        vest.released = vest.released.add(unreleased);
        vest.balance = vest.balance.sub(unreleased);

        _token.safeTransfer(beneficiary, unreleased);
        emit Released(unreleased);
    }

    /**
        @notice Give amount of tokens can be sent to beneficiary.
        However, these tokens at this moment of time don't belong to beneficiary.
        If current moment is before cliff then zero tokens can be sent.
        @param beneficiary tokens' holder
        @return releasable amount for holder
     */
    function releasableAmount(address beneficiary) public view returns (uint256) {
        if (_getCurrentBlockTime() < _vestings[beneficiary].start) {
            return 0;
        }
        return vestedAmount(beneficiary).sub(_vestings[beneficiary].released);
    }

     /**
        @notice Give amount of tokens vested to beneficiary
        Vested amount depends on block's timestamp linearly.
        It depends on how much intervals has passed since the start.
        Before the start of vesting amount is 0.
        After the end (start+duration) amount is equal to total balance.
        During the vesting amount is calculate with the help of intervals.
        @param beneficiary tokens' holder
        @return amount vested to holder
     */
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

contract TokenVestingSeed is TokenVesting {
    constructor(address token) TokenVesting(token) {}
}

contract TokenVestingPrivate1 is TokenVesting {
    constructor(address token) TokenVesting(token) {}
}

contract TokenVestingPrivate2 is TokenVesting {
    constructor(address token) TokenVesting(token) {}
}

contract TokenVestingStrategic is TokenVesting {
    constructor(address token) TokenVesting(token) {}
}
