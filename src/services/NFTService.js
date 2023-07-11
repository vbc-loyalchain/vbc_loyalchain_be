import NFT from "../models/NFT";
import Token from "../models/Token";
import { create, getById, getOne } from "../repositories";
import providers from "../config/providers";
import {ERC20TokenContract} from '../config/contract/ERC20Token';
import {ERC721NftContract} from '../config/contract/ERC721Nft';

class NFTService {
    createNewNFT = async (params, admin) => {
        const {
            collectionAddress,
            enterprise,
            NFTId,
            price,
            isSelling
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

        const [isAdmin, enterpriseAddress] = await Promise.all([isAdminPromise, enterprisePromise]);
        if(enterpriseAddress !== token.deployedAddress || !isAdmin) {
            throw {
                statusCode: 400,
                error: new Error('Only admins can mint NFT')
            }
        }

        let newNFT = await create(NFT, {
            collectionAddress,
            enterprise,
            NFTId,
            owner: admin.id,
            price,
            isSelling
        });

        newNFT = await newNFT.populate([
            {path: 'owner', select: '_id address'},
            {path: 'enterprise', select: '_id name symbol deployedAddress network image'}
        ]);

        return newNFT;
    }
}

export default new NFTService();