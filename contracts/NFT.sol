// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Token.sol";

contract NFT is ERC721URIStorage, Ownable {
    Token public enterprise;

    struct NFTInfo {
        uint256 price;
        bool isSelling;
    }

    mapping (uint256 => NFTInfo) NFTs; //tokenId => info

    constructor (address enterprise_) ERC721(Token(enterprise_).name(), Token(enterprise_).symbol()) {
        enterprise = Token(enterprise_);
    }

    modifier onlyAdmin() {
        require(enterprise.admins(msg.sender), "Only admin can call this function");
        _;
    }

    function mint(
        address _to,
        uint256 _tokenId,
        string calldata _uri,
        uint256 price
    ) external onlyAdmin {
        _mint(_to, _tokenId);
        _setTokenURI(_tokenId, _uri);
        NFTs[_tokenId] = NFTInfo({
            price: price,
            isSelling: true
        });
    }

    function buyNFT(uint256 _tokenId) external  {
        _requireMinted(_tokenId);
        NFTInfo storage info = NFTs[_tokenId];
        
        require(info.isSelling, "This NFT hasn't been sold by the owner");
        
        enterprise.transferFrom(msg.sender, ownerOf(_tokenId), info.price);
        _transfer(ownerOf(_tokenId), msg.sender, _tokenId);
        info.isSelling = false;
    }

    function setSellingNFT(uint256 _tokenId, bool isSelling) external  {
        _requireMinted(_tokenId);
        require(ownerOf(_tokenId) == msg.sender, "Only owner can sell their NFTs");
        NFTInfo storage info = NFTs[_tokenId];
        info.isSelling = isSelling;
    }

    function setPrice(uint256 _tokenId, uint256 price) external {
        require(_isApprovedOrOwner(msg.sender, _tokenId), "ERC721: caller is not token owner or approved");
        NFTInfo storage info = NFTs[_tokenId];
        info.price = price;
    }

    function getNFTInfo(uint256 _tokenId) external view returns (uint256 price, bool isSelling) {
        _requireMinted(_tokenId);
        NFTInfo memory info = NFTs[_tokenId];
        price = info.price;
        isSelling = info.isSelling;
    }
}