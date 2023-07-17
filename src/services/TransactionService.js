import CryptoJS from "crypto-js";
import dotenv from 'dotenv';
import {create, getById, getOne, getAllBeforePopulate, updateEntryById} from '../repositories'
import Transaction from "../models/Transaction"
import User from '../models/User';
import providers from '../config/providers';
import mongoose from 'mongoose';
import {SwapTwoChainContract} from '../config/variables';
import {SwapTwoChain} from '../config/contract/SwapTwoChain';
dotenv.config();

const PAGE_SIZE = 16;

class TransactionService {
    getGeneralInfo = async () => {
        const totalNow = Transaction.countDocuments({
            transactionType: 'exchange',
            status: 'pending'
        });

        const total24h = Transaction.countDocuments({
            createdAt: {
                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
        })

        const total = Transaction.estimatedDocumentCount();

        const data = await Promise.all([total, total24h, totalNow])

        return {
            total: data[0],
            total24h: data[1],
            totalNow: data[2]
        }
    }

    getAllExchangeTx = async (filter) => {
        const {
            fromTokenId,
            fromValueUp,
            fromValueDown,

            toTokenId,
            toValueUp,
            toValueDown,

            network,
            page
        } = filter;


        const filterQuery = {
            'fromValue.amount': {
                $gte: fromValueDown,
                $lte: fromValueUp
            },

            'toValue.amount': {
                $gte: toValueDown,
                $lte: toValueUp
            },
            transactionType: 'exchange',
            status: 'pending'
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

        let allExchangeTx = await getAllBeforePopulate(Transaction, filterQuery, null, options).populate([
            {path: 'from', select: '_id address'},
            {path: 'to', select: '_id address'},
            {path: 'fromValue.token', select: '-createdAt -updatedAt -__v'},
            {path: 'toValue.token', select: '-createdAt -updatedAt -__v'},
        ]);
        
        //get all exchange tx that user can buy in this chainId
        if(network !== -1){
            allExchangeTx = allExchangeTx.filter(tx => tx.toValue.token.network === network);
        }

        return allExchangeTx;
    }

    exchangeRate = async (tokenId1, tokenId2) => {
        const query1 = Transaction.aggregate([
            {
                $match: {
                    transactionType: 'exchange',
                    'fromValue.token': new mongoose.Types.ObjectId(tokenId1),
                    'toValue.token': new mongoose.Types.ObjectId(tokenId2),
                    status: {
                        $in: ['pending', 'completed']
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalFrom: {
                        $sum: "$fromValue.amount"
                    },
                    totalTo: {
                        $sum: "$toValue.amount"
                    }
                }
            }
        ]).exec()

        const query2 = Transaction.aggregate([
            {
                $match: {
                    transactionType: 'exchange',
                    'fromValue.token': new mongoose.Types.ObjectId(tokenId2),
                    'toValue.token': new mongoose.Types.ObjectId(tokenId1),
                    status: {
                        $in: ['pending', 'completed']
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalFrom: {
                        $sum: "$fromValue.amount"
                    },
                    totalTo: {
                        $sum: "$toValue.amount"
                    }
                }
            }
        ]).exec()

        const [[res1], [res2]] = await Promise.all([query1, query2]);
        const rate = ((res1 ? res1.totalFrom : 0) + (res2 ? res2.totalTo : 0)) / ((res1 ? res1.totalTo : 0) + (res2 ? res2.totalFrom : 0));
        return Number(rate.toFixed(2));
    }

    createTransferTx = async (body) => {
        const {
            user, 
            to,
            fromValue,
            fromTokenId,
            toValue, 
            toTokenId,
        } = body;

        const toUser = await getOne(User, {address: to})

        let newTransaction = await create(Transaction, {
            from: user.id,
            to: toUser._id,
            fromValue: {
                token: fromTokenId,
                amount: fromValue
            },
            toValue: {
                token: toTokenId,
                amount: toValue
            },
            transactionType: 'transfer',
            status: 'completed'
        });

        newTransaction = await newTransaction.populate([
            {path: 'from', select: '_id address'},
            {path: 'to', select: '_id address'},
            {path: 'fromValue.token', select: '-createdAt -updatedAt -__v'},
            {path: 'toValue.token', select: '-createdAt -updatedAt -__v'},
        ])

        return newTransaction;
    }

    createExchangeTx = async (body) => {
        const {
            user, 
            fromValue,
            fromTokenId,
            toValue, 
            toTokenId,
            timelock,
            txId
        } = body;
        
        let newTransaction = await create(Transaction, {
            from: user.id,
            to: null,
            fromValue: {
                token: fromTokenId,
                amount: fromValue
            },
            toValue: {
                token: toTokenId,
                amount: toValue
            },
            transactionType: 'exchange',
            status: 'pending',
            timelock,
            txId
        });

        newTransaction = await newTransaction.populate([
            {path: 'from', select: '_id address'},
            {path: 'to', select: '_id address'},
            {path: 'fromValue.token', select: '-createdAt -updatedAt -__v'},
            {path: 'toValue.token', select: '-createdAt -updatedAt -__v'},
        ])

        return newTransaction;
    }

    /**
     * @param {string} txId - Id of the transaction in database
     * @param {string} hashlock - Hash of the secret key for tx
     * @param {object} receiver - request's sender (receiver)
     */
    acceptExchangeTx = async (txId, hashlock, receiver) => {
        let tx = await getById(Transaction, txId);
        tx = await tx.populate([
            {path: 'fromValue.token', select: 'network'},
            {path: 'toValue.token', select: 'network'}
        ])

        if(tx.fromValue.token.network !== tx.toValue.token.network && !hashlock) {
            throw {
                statusCode: 400,
                error: new Error("Hashlock is required")
            }
        }

        //check whether this transaction has been accepted by another user
        if(tx.status !== 'pending'){
            throw {
                statusCode: 400,
                error: new Error("Can't accept a transaction that is in progress or has been done")
            }
        }

        //check whether owner address is the same as receipient address
        if(tx.from.toString() === receiver.id) {
            throw {
                statusCode: 400,
                error: new Error("Cannot accept by yourself")
            }
        }
 
        const updateObj = {
            to: receiver.id,
            status: tx.fromValue.token.network === tx.toValue.token.network ? 'completed' : 'receiver accepted',
            hashlock,
        };

        const updatedTx = await this.updateTx(txId, updateObj)

        return updatedTx;
    }

    /**
     * @param {string} txId - Id of the transaction
     * @param {object} sender - request's sender
     * @returns 
     */
    cancelExchangeTx = async (txId, sender) => {
        let tx = await getById(Transaction, txId);

        //check whether the transaction has been cancelled or completed
        if(tx.status === 'completed' || tx.status === 'canceled' || tx.status === 'receiver withdrawn')
            throw {
                statusCode: 400,
                error: new Error("Can't cancel a transaction that is in progress or has been done")
            }
        
        //if status is pending, only owner can cancel this transaction
        if(tx.status === 'pending' && tx.from.toString() !== sender.id)
            throw {
                statusCode: 400,
                error: new Error("Only owner can cancel this transaction")
            }

        //if status is waiting for receiver, only receiver can cancel
        if((tx.status === 'receiver accepted' || tx.status === 'sender accepted') && 
            (tx.from.toString() !== sender.id && tx.to.toString() !== sender.id))
            throw {
                statusCode: 400,
                error: new Error("Now only owner and receiver can cancel this transaction")
            }
                   
        const updatedTx = await this.updateTx(txId, {
            status: 'canceled'
        })

        return updatedTx;
    }

    updateTx = async (txId, updateObj) => {
        let updatedTx = await updateEntryById(Transaction, txId, updateObj, {
            new: true
        })

        updatedTx = await updatedTx.populate([
            {path: 'from', select: '_id address'},
            {path: 'to', select: '_id address'},
            {path: 'fromValue.token', select: '-createdAt -updatedAt -__v'},
            {path: 'toValue.token', select: '-createdAt -updatedAt -__v'},
        ])

        return updatedTx;
    }

    /**
     * @param {*} txId - Id of the transaction in Blockchain
     * @param {*} callerAddress - Address of the caller who made this request 
     * @param {*} nonce - current nonce of the caller account
     * @param {*} network - network of the SwapTwoChain contract which was deployed
     */
    getSignatureRefund = async (txId, callerAddress, nonce, network) => {
        const provider = providers[network];
        const SCA = SwapTwoChainContract[network];

        const isEndLock = await provider.callFunc(SwapTwoChain.abi, SCA, 'isEndLockContract', [txId], callerAddress);

        if(!isEndLock) {
            throw {
                statusCode: 400,
                error: new Error('Too early to refund from smart contract')
            }
        }

        const refunded = await provider.callFunc(SwapTwoChain.abi, SCA, 'isRefunded', [txId], callerAddress)

        if(refunded) {
            throw {
                statusCode: 400,
                error: new Error('You have been refunded this transaction')
            }
        }

        const privateKey = CryptoJS.AES.decrypt(
            process.env.PRIVATE_KEY_ENCRYPT,
            process.env.PRIVATE_KEY_SECRET
        ).toString(CryptoJS.enc.Utf8);

        const data = [
            {
                type: "string",
                value: txId,
            },
            {
                type: "address",
                value: callerAddress,
            },
            {
                type: "uint256",
                value: nonce,
            }
        ]

        const signature = provider.signData(data, privateKey)
        return signature;
    };
}

export default new TransactionService()