// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

/**
 * @title TokenVesting
 */
contract TokenVesting is Context, ReentrancyGuard {
    using SafeERC20 for IERC20;

    event LockRelease(address beneficiary, uint256 amount);
    event VestRelease(address beneficiary, uint256 amount);
    event Allocate(address beneficiary, uint256 amount);

    IERC20 public token;

    // relative values of how much allocated funds are locked by timeLock and vesting
    // expressed in 1/10000 basis points. The total should be 10000 (100%)
    uint256 public lockBps;
    uint256 public vestBps;

    // the moment when time-locked amount becomes available for claiming
    uint256 public lockClaimTime;

    // vesting parameters
    uint256 public vestStart; // the moment of gradual unlocking of vest funds
    uint256 public vestDuration; // the total timespan of vesting
    // receipt of funds tied to intervals. If user claimed in current interval,
    // he can't claim funds again before interval expired
    uint256 public vestInterval;

    struct Allocation {
        // amount allocated for given beneficiary
        // Virtually divided into two parts - timeLock and vest
        uint256 amount;
        // amount already paid out to the user
        uint256 released;
    }

    mapping(address => Allocation) public allocations;

    constructor(
        address _token,
        uint256 _lockBps,
        uint256 _vestBps,
        uint256 _lockClaimTime,
        uint256 _vestStart,
        uint256 _vestDuration,
        uint256 _vestInterval
    ) {
        require(_token != address(0), "token address cannot be zero");
        token = IERC20(_token);
        lockBps = _lockBps;
        vestBps = _vestBps;
        // todo: check sum of them equals to 10000
        lockClaimTime = _lockClaimTime;
        vestStart = _vestStart;
        // todo: check lockClaimTime goes first
        vestDuration = _vestDuration;
        vestInterval = _vestInterval;
        // todo: check vestingDuration > vestingInterval;
        // todo: check vestingInterval > 0;
    }

    /**
    @notice Returns current timestamp
    @return timestamp of current block
     */
    function _getCurrentBlockTime() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    function getAllocation(address beneficiary)
        public
        view
        returns (
            // todo: reorder in more structured way
            uint256 amount,
            uint256 lockAmount,
            uint256 vestAmount,
            uint256 released,
            uint256 lockReleased,
            uint256 vestReleased,
            uint256 unfrozen,
            uint256 lockUnfrozen,
            uint256 vestUnfrozen
        )
    {
        amount = allocations[beneficiary].amount;
        lockAmount = (amount * lockBps) / 10000;
        vestAmount = (amount * vestBps) / 10000;

        released = allocations[beneficiary].released;

        if (released >= lockAmount) {
            lockReleased = lockAmount;
            if (released > lockReleased) {
                vestReleased = released - lockReleased;
            }
        }

        lockUnfrozen = getLockUnfrozen(lockAmount);
        vestUnfrozen = getVestUnfrozen(vestAmount);
        unfrozen = lockUnfrozen + vestUnfrozen;
    }

    function setAllocations(bytes[] memory _allocations) external nonReentrant {
        uint256 totalAmount;
        for (uint256 i = 0; i < _allocations.length; i++) {
            (address beneficiary, uint256 amount) = abi.decode(_allocations[i], (address, uint256));
            totalAmount += amount;
            require(allocations[beneficiary].amount == 0, "Already allocated");
            require(allocations[beneficiary].released == 0, "Already released");
            allocations[beneficiary].amount = amount;
            emit Allocate(beneficiary, amount);
        }

        token.safeTransferFrom(_msgSender(), address(this), totalAmount);
    }

    function getLockUnfrozen(uint256 lockAmount) public view returns (uint256) {
        if (_getCurrentBlockTime() >= lockClaimTime) {
            return lockAmount;
        }
        return 0;
    }

    function getVestUnfrozen(uint256 vestAmount) public view returns (uint256) {
        uint256 vestEnd = vestStart + vestDuration;
        if (_getCurrentBlockTime() <= vestStart) {
            return 0;
        }
        if (_getCurrentBlockTime() >= vestEnd) {
            return vestAmount;
        }
        uint256 startedInvervals = (_getCurrentBlockTime() - vestStart) / vestInterval + 1;
        uint256 totalIntervals = vestDuration / vestInterval;
        uint256 vestUnfrozenAmount = (vestAmount * startedInvervals) / totalIntervals;
        return vestUnfrozenAmount;
    }

    /**
        @notice Release (i.e. send) vested tokens to beneficiary
        @param beneficiary owner of tokens
     */
    function release(address beneficiary) external nonReentrant {
        (
            uint256 amount,
            uint256 lockAmount,
            uint256 vestAmount,
            uint256 released,
            uint256 lockReleased,
            uint256 vestReleased,
            uint256 unfrozen,
            uint256 lockUnfrozen,
            uint256 vestUnfrozen
        ) = getAllocation(beneficiary);

        uint256 lockReleasable = lockUnfrozen - lockReleased;
        uint256 vestReleasable = vestUnfrozen - vestReleased;

        require(released < amount, "Amount already released");
        require(lockReleasable + vestReleasable > 0, "Nothing to release yet");

        if (lockReleasable > 0) {
            allocations[beneficiary].released += lockReleasable;
            emit LockRelease(beneficiary, lockReleasable);
            token.safeTransfer(beneficiary, lockReleasable);
        }

        if (vestReleasable > 0) {
            allocations[beneficiary].released += vestReleasable;
            emit VestRelease(beneficiary, vestReleasable);
            token.safeTransfer(beneficiary, vestReleasable);
        }
    }
}

contract VestingGameStarter is TokenVesting {
    constructor(
        address _token,
        uint256 _lockBps,
        uint256 _vestBps,
        uint256 _lockClaimTime,
        uint256 _vestStart,
        uint256 _vestDuration,
        uint256 _vestInterval
    ) TokenVesting(_token, _lockBps, _vestBps, _lockClaimTime, _vestStart, _vestDuration, _vestInterval) {}
}
