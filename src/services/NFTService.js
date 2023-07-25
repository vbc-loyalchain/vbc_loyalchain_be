import NFT from "../models/NFT.js";
import Token from "../models/Token.js";
import { create, getAllBeforePopulate, getById, getOne, updateEntryById } from "../repositories/index.js";
import providers from "../config/providers.js";
import {ERC20TokenContract} from '../config/contract/ERC20Token.js';
import {ERC721NftContract} from '../config/contract/ERC721Nft.js';

const PAGE_SIZE = 12;

class NFTService {
    getAllNFTInMarket = async (dto) => {
        const {upperBoundPrice, lowerBoundPrice} = dto;

        if(upperBoundPrice < lowerBoundPrice) {
            throw {
                statusCode: 400,
                error: new Error("UpperBoundPrice mustn't be less than lowerBoundPrice")
            }
        }

        const filterObj = {
            price: {
                $lte: upperBoundPrice,
                $gte: lowerBoundPrice
            },
            isSelling: true,
            deleted: false
        };

        const options = {
            skip: (dto.page - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
            sort: {
                createdAt: -1
            }
        };

        let allNFTInMarket = await getAllBeforePopulate(NFT, filterObj, null, options).populate([
            {path: 'owner', select: '_id address'},
            {path: 'enterprise', select: '-createdAt -updatedAt -__v'}
        ]);

        if(dto.network) {
            allNFTInMarket = allNFTInMarket.filter(nft => nft.enterprise.network === dto.network);
        }

        return allNFTInMarket;
    }

    createNewNFT = async (params, admin) => {
        const {
            collectionAddress,
            enterprise,
            NFTId,
        } = params;

        const existedNFT = await getOne(NFT, {
            collectionAddress,
            NFTId
        })

        if(existedNFT) {
            throw {
                statusCode: 400,
                error: new Error('NFT already exists')
            }
        }

        const token = await getById(Token, enterprise);
        const provider = providers[token.network];
        const isAdminPromise = provider.callFunc(ERC20TokenContract.abi, token.deployedAddress, 'admins', [admin.address], admin.address);
        const enterprisePromise = provider.callFunc(ERC721NftContract.abi, collectionAddress, 'enterprise', [], admin.address);
        const ownerOfNFTPromise = provider.callFunc(ERC721NftContract.abi, collectionAddress, 'ownerOf', [NFTId], admin.address);

        const [isAdmin, enterpriseAddress, ownerOfNFT] = await Promise.all([isAdminPromise, enterprisePromise, ownerOfNFTPromise]);
        if(enterpriseAddress !== token.deployedAddress || !isAdmin) {
            throw {
                statusCode: 403,
                error: new Error('Only admins of this collection can mint NFT')
            }
        }

        if(ownerOfNFT !== admin.address){
            throw {
                statusCode: 403,
                error: new Error("The owner doesn't match with the creator address")
            }
        }

        let newNFT = await create(NFT, {
            collectionAddress,
            enterprise,
            NFTId,
            owner: admin.id,
        });

        newNFT = await newNFT.populate([
            {path: 'owner', select: '_id address'},
            {path: 'enterprise', select: '-createdAt -updatedAt -__v'}
        ]);

        return newNFT;
    }

    /**
     * @param {*} id - Id of the NFT in database
     * @param {*} caller - sender who send the request
     * @param {*} updateObj - Object for updating the NFT
     */
    updateNFT = async (id, caller, updateObj) => {
        const nft = await getById(NFT, id);
        const token = await getById(Token, nft.enterprise);
        const provider = providers[token.network];

        const owner = await provider.callFunc(ERC721NftContract.abi, nft.collectionAddress, 'ownerOf', [nft.NFTId], caller.address);
        if(owner !== caller.address) {
            throw {
                statusCode: 403,
                error: new Error('You are not the owner of NFT')
            }
        }

        let updatedNFT = await updateEntryById(NFT, id, {
            ...updateObj,
            owner: caller.id
        }, {
            new: true
        })
        
        updatedNFT = await updatedNFT.populate([
            {path: 'owner', select: '_id address'},
            {path: 'enterprise', select: '-createdAt -updatedAt -__v'}
        ])

        return updatedNFT;
    }

    /**
     * @param {*} id - Id of the NFT in database
     * @param {*} caller - sender who send the request
     */
    deleteNFT = async (id, caller) => {
        const nft = await getById(NFT, id);
        if(nft.owner.toString() !== caller.id){
            throw {
                statusCode: 403,
                error: new Error('You are not the owner of NFT')
            }
        }
        
        await updateEntryById(NFT, id, {
            deleted: true
        }, {});
    }
}

export default new NFTService();