// SPDX-License-Identifier: unlicense

pragma solidity ^0.8.0;

import "../MetarunCollection.sol";

contract MetarunCollectionMock is MetarunCollection{

     function exists(uint256 id) public view virtual override returns (bool) {
        return id == id; // function always gives true
    }
}
