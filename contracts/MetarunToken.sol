//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "hardhat/console.sol";

contract MetarunToken is ERC20 {

    constructor() ERC20("METARUN", "MRUN") {
    }

    /**
     * @dev Creates `amount` new tokens for `to`.
     *
     * See {ERC20-_mint}.
     *
     */
    function mint(address to, uint256 amount) public virtual {
        // todo: SECURITY ISSUE, should be protected by specific role!
        _mint(to, amount);
    }
    
}
