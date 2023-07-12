import { getAllBeforePopulate } from "../repositories";
import User from "../models/User";
import NFT from "../models/NFT";
import Transaction from "../models/Transaction";

const PAGE_SIZE = 15;

class UserService {
    getUser() {
        return {
            name: 'admin',
            password: '123'
        }
    }

    getMyTx = async (userId, dto) => {
        const {
            fromTokenId,
            fromValueUp,
            fromValueDown,

            toTokenId,
            toValueUp,
            toValueDown,

            transactionType,
            page
        } = dto;

        const filterQuery = {
            $or: [
                {from: {$eq: userId}},
                {to: {$eq: userId}},
            ],
            'fromValue.amount': {
                $gte: fromValueDown,
                $lte: fromValueUp
            },

            'toValue.amount': {
                $gte: toValueDown,
                $lte: toValueUp
            },
            transactionType: transactionType === 'all' ? {
                $in: ['exchange', 'transfer']
            } : transactionType
        };

        if(fromTokenId) filterQuery['fromValue.token'] = fromTokenId;
        if(toTokenId) filterQuery['toValue.token'] = toTokenId;

        const options = {
            skip: (page - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
            sort: {
                createdAt: -1
            }
        };

        const myTx = await getAllBeforePopulate(Transaction, filterQuery, null, options).populate([
            {path: 'from', select: '_id address'},
            {path: 'to', select: '_id address'},
            {path: 'fromValue.token', select: '-createdAt -updatedAt -__v'},
            {path: 'toValue.token', select: '-createdAt -updatedAt -__v'},
        ])

        return myTx;
    }

    getMyNFT = async (userId, dto) => {
        const upperBoundPrice = dto.upperBoundPrice ? parseInt(dto.upperBoundPrice) : Infinity;
        const lowerBoundPrice = dto.lowerBoundPrice ? parseInt(dto.lowerBoundPrice) : 0;

        if(upperBoundPrice < lowerBoundPrice) {
            throw {
                statusCode: 400,
                error: new Error("UpperBoundPrice mustn't be less than lowerBoundPrice")
            }
        }

        const filterObj = {
            owner: userId,
            price: {
                $lte: upperBoundPrice,
                $gte: lowerBoundPrice
            },
            deleted: false
        };

        const options = {
            skip: (parseInt(dto.page) - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
            sort: {
                createdAt: -1
            }
        };

        let myNFT = await getAllBeforePopulate(NFT, filterObj, null, options).populate([
            {path: 'enterprise', select: '-createdAt -updatedAt -__v'}
        ]);

        if(dto.network) {
            myNFT = myNFT.filter(nft => nft.enterprise.network === parseInt(dto.network));
        }

        return myNFT;
    }
}

export default new UserService()