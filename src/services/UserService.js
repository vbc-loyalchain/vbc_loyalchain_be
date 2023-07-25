import { getAllBeforePopulate } from "../repositories/index.js";
import NFT from "../models/NFT.js";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

const PAGE_SIZE = 12;

class UserService {

    getMyTx = async (userId, dto) => {
        const {
            fromTokenId,
            fromValueUp,
            fromValueDown,

            toTokenId,
            toValueUp,
            toValueDown,

            transactionType,
            status,
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

        switch(status) {
            case 0: 
                filterQuery['status'] = 'pending';
                break;
            case 1: 
                filterQuery['status'] = {
                    $in: ['receiver accepted', 'sender accepted', 'receiver withdrawn', 'sender cancelled', 'receiver cancelled']
                };
                break;
            case 2:
                filterQuery['status'] = 'completed';
        }
        
        const options = {
            skip: (page - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
            sort: {
                updatedAt: -1
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
        const {upperBoundPrice, lowerBoundPrice} = dto;  

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

        if(dto.isSelling !== undefined) {
            filterObj.isSelling = dto.isSelling;
        }

        const options = {
            skip: (dto.page - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
            sort: {
                createdAt: -1
            }
        };

        let myNFT = await getAllBeforePopulate(NFT, filterObj, null, options).populate([
            {path: 'enterprise', select: '-createdAt -updatedAt -__v'}
        ]);

        if(dto.network) {
            myNFT = myNFT.filter(nft => nft.enterprise.network === dto.network);
        }

        return myNFT;
    }

    /**
     * @param {string} userId: ID of the user calling the request 
     */
    getUsersRecentlyTransacted = async (userId) => {
        let usersRecentlyTransacted = await Transaction.aggregate([
            {
                $match: {
                    transactionType: 'transfer',
                    from: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "to",
                    foreignField: "_id",
                    as: "to",
                }
            },
            {
                $unwind: '$to'
            },
            {
                $group: {
                    _id: '$to.address',
                    latest: { $last: '$createdAt' }
                }
            },
            {
                $sort: {
                    latest: -1
                }
            },
            {
                $limit: 10
            }
        ]).exec();

        usersRecentlyTransacted = usersRecentlyTransacted.map(user => user._id);
        return usersRecentlyTransacted;
    }

    getUsersMostlyTransacted = async (userId) => {
        let usersMostlyTransacted = await Transaction.aggregate([
            {
                $match: {
                    transactionType: 'transfer',
                    from: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "to",
                    foreignField: "_id",
                    as: "to",
                }
            },
            {
                $unwind: '$to'
            },
            {
                $group: {
                    _id: '$to.address',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    count: -1
                }
            },
            {
                $limit: 10
            }
        ]).exec();

        usersMostlyTransacted = usersMostlyTransacted.map(user => ({
            address: user._id,
            count: user.count
        }));
        return usersMostlyTransacted;
    }
}

export default new UserService()