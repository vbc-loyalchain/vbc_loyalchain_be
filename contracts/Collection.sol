// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Token.sol";

contract Collection is ERC721URIStorage, Ownable {
    Token public enterprise;

    constructor (address enterprise_) ERC721(Token(enterprise_).name(), Token(enterprise_).symbol()) {
        enterprise = Token(enterprise_);
    }

    modifier onlyAdmin() {
        require(enterprise.admins(msg.sender), "Only admin can call this function");
        _;
    }

    function mint(
        uint256 _tokenId,
        string calldata _uri
    ) external onlyAdmin {
        _mint(msg.sender, _tokenId);
        _setTokenURI(_tokenId, _uri);
    }
}