// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Collection.sol";
import "./Token.sol";

contract NFTMarket {

    mapping (bytes32 => uint256) NFTInfos; //id => NFT info

    function sellNFT(address collectionAddress, uint256 tokenId, uint256 price) external {
        Collection collection = Collection(collectionAddress);
        require(collection.ownerOf(tokenId) == msg.sender, "Caller is not owner of NFT"); 
        bytes32 NFTInfoId = defineNFTInfoId(collectionAddress, tokenId);
        NFTInfos[NFTInfoId] = price;
    }

    function buyNFT(address collectionAddress, uint256 tokenId) external {
        bytes32 NFTInfoId = defineNFTInfoId(collectionAddress, tokenId);
        require(NFTInfos[NFTInfoId] > 0, "Can't buy this NFT");

        Collection collection = Collection(collectionAddress);
        Token token = Token(collection.enterprise());

        //transfer token to owner of this NFT
        token.transferFrom(msg.sender, collection.ownerOf(tokenId), NFTInfos[NFTInfoId]);
        //owner transfer their NFT to msg.sender
        collection.safeTransferFrom(collection.ownerOf(tokenId), msg.sender, tokenId);

        //reset nft info
        delete NFTInfos[NFTInfoId];
    }

    function cancel(address collectionAddress, uint256 tokenId) external {
        Collection collection = Collection(collectionAddress);
        require(collection.ownerOf(tokenId) == msg.sender, "Caller is not owner of NFT");

        bytes32 NFTInfoId = defineNFTInfoId(collectionAddress, tokenId);
        require(NFTInfos[NFTInfoId] > 0, "This NFT hasn't been sold");

        delete NFTInfos[NFTInfoId];
    }

    function setPrice(address collectionAddress, uint256 tokenId, uint256 price) external {
        Collection collection = Collection(collectionAddress);
        require(collection.ownerOf(tokenId) == msg.sender, "Caller is not owner of NFT");

        bytes32 NFTInfoId = defineNFTInfoId(collectionAddress, tokenId);
        require(NFTInfos[NFTInfoId] > 0, "This NFT hasn't been sold");

        NFTInfos[NFTInfoId] = price;
    }

    function defineNFTInfoId(address collectionAddress, uint256 tokenId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(collectionAddress, tokenId));
    } 
}