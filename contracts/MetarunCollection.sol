// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MetarunCollection is ERC1155, AccessControl {

    uint256 public constant tokenTypeNonFungible = 0;
    uint256 public constant tokenTypeFungible = 1;
    uint256 public constant tokenTypeFungibleLimited = 2;

    uint256 public constant natureCharacter = 0;
    uint256 public constant natureCharacteristic = 1;

    struct TokenType {
        uint256 typeFungible;
        uint256 nature; // character or characteristic
        uint256 typeNature; // characterTypeCraftsman or characterTypeFighter
    }

    mapping(uint256 => TokenType) tokenTypes;

    struct Characteristics {
        uint256 tokenID;
    }

    // in this place, you can associate the type of token with the type of characteristic
    uint256 public constant characteristicTypeSkin = 0;
    uint256 public constant characteristicTypeLevel = 1;

    mapping(uint256 => Characteristics[]) characters; // main state

    uint256 public constant characterTypeCraftsman = 0;
    uint256 public constant characterTypeFighter = 1;
    uint256 public constant characterTypeSprinter = 2;

    uint256 public currentTokenID;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(string memory uri) ERC1155(uri) {
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function mint(
        address _to,
        uint256 _amount,
        uint256 _typeFungible,
        uint256 _nature,
        uint256 _typeNature
    ) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "METARUNCOLLECTION: need MINTER_ROLE");

        if (_typeFungible == tokenTypeNonFungible) {
            require(_amount == 1);

        } else if (_typeFungible == tokenTypeFungibleLimited){
            require(_amount <= 100);
        }

        uint256 token_id = currentTokenID;

        TokenType memory tokenType = TokenType(_typeFungible, _nature, _typeNature);
        tokenTypes[token_id] = tokenType;

        _mint(_to, token_id, _amount, "");
        currentTokenID++;
    }

    function addCharacteristic(
        address _to,
        uint256 _amount,
        uint256 _typeFungible,
        uint256 _nature,
        uint256 _typeNature,
        uint256 _characterID
    ) public {

        if (_typeFungible == tokenTypeNonFungible) {
            require(_amount == 1);

        } else if (_typeFungible == tokenTypeFungibleLimited){
            require(_amount <= 100);
        }

        uint256 token_id = currentTokenID;
        _mint(_to, token_id, _amount, "");
        currentTokenID++;
        TokenType memory tokenType = TokenType(_typeFungible, _nature, _typeNature);
        tokenTypes[token_id] = tokenType;
        Characteristics memory characteristic = Characteristics(token_id);
        characters[_characterID].push(characteristic);
    }

    function getCharacteristics(uint256 _characterID) public view returns(Characteristics[] memory){
        return characters[_characterID];
    }

    function setURI(string memory newUri) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "METARUNCOLLECTION: need DEFAULT_ADMIN_ROLE");
        _setURI(newUri);
    }
}
