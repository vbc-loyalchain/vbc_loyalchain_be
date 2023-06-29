import {create, getById, getOne, getAll, getAllBeforePopulate, updateEntryById} from '../repositories'
import Transaction from "../models/Transaction"
import Token from "../models/Token";
import User from '../models/User';
import { ERC20TokenContract } from "../config/contract/ERC20Token";
import providers from '../config/providers';
import mongoose from 'mongoose';

const PAGE_SIZE = 15;

class TransactionService {
    getAllExchangeTx = async (filter) => {
        const {
            fromTokenId,
            fromValueUp,
            fromValueDown,

            toTokenId,
            toValueUp,
            toValueDown,

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
            transactionType: 'exchange'
        };

        if(fromTokenId) filterQuery['fromValue.token'] = fromTokenId;
        if(toTokenId) filterQuery['toValue.token'] = toTokenId;

        const options = {
            skip: (page - 1) * PAGE_SIZE,
            limit: PAGE_SIZE
        };

        const allExchangeTx = await getAllBeforePopulate(Transaction, filterQuery, null, options)
                                .populate('from', '-password')
                                .populate('to', '-password')
                                .populate('fromValue.token')
                                .populate('toValue.token')

        return allExchangeTx;
    }

    getMyTx = async (userId, filter) => {
        const {
            fromTokenId,
            fromValueUp,
            fromValueDown,

            toTokenId,
            toValueUp,
            toValueDown,

            transactionType,
            page
        } = filter;

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
            limit: PAGE_SIZE
        };

        const myTx = await getAllBeforePopulate(Transaction, filterQuery, null, options)
                                .populate('from', '-password')
                                .populate('to', '-password')
                                .populate('fromValue.token')
                                .populate('toValue.token')

        return myTx;

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

    createNewTransaction = async (body) => {
        const {
            from, 
            to,
            fromValue,
            fromTokenId,
            toValue, 
            toTokenId,
            transactionType,
        } = body;

        let fromUser, toUser

        fromUser = await getOne(User, {
            address: from
        });

        if(to) {
            toUser = await getOne(User, {
                address: to
            });
        }
        
        let newTransaction = await create(Transaction, {
            from: fromUser._id,
            to: toUser ? toUser._id : null,
            fromValue: {
                token: fromTokenId,
                amount: fromValue
            },
            toValue: {
                token: toTokenId,
                amount: toValue
            },
            transactionType,
            status: 'pending'
        });

        newTransaction = await newTransaction.populate('from', '-password');
        newTransaction = await newTransaction.populate('fromValue.token');
        newTransaction = await newTransaction.populate('toValue.token');

        if(to) {
            newTransaction = await newTransaction.populate('to', '-password')
        }

        if(transactionType === 'transfer') {
            const fromToken = await getById(Token, fromTokenId);
            const provider = providers[fromToken.network];
            const ABI = ERC20TokenContract.abi;

            // const decimals = Number(await provider.callFunc(ABI, fromToken.deployedAddress, 'decimals', [], from));
            // const amount = BigInt(fromValue * (10 ** decimals)); 
            const rawTx = await provider.createRawEIP1559(ABI, fromToken.deployedAddress, 'transfer', [to, BigInt(fromValue)], from)

            return {
                newTransaction,
                rawTx
            }
        }
        else {
            return newTransaction;
        }
    }

    acceptExchangeTx = async (txId, receipientAddress) => {
        let tx = await getById(Transaction, txId);

        if(tx.status !== 'pending')
            throw {
                statusCode: 400,
                error: new Error("Can't update a transaction that has been done")
            }

        if(tx.to) {
            throw {
                statusCode: 400,
                error: new Error("This transaction has been accepted by another user")
            }
        }
        else {
            //update transaction receipient and tx status
            //make exchange token
            //return updated transaction
        }
    }

    cancelExchangeTx = async (txId, senderAddress) => {
        let tx = await getById(Transaction, txId);
        tx = await tx.populate('from', '-password');

        if(tx.status !== 'pending')
            throw {
                statusCode: 400,
                error: new Error("Can't cancel a transaction that has been done")
            }
        
        if(tx.from.address !== senderAddress)
            throw {
                statusCode: 400,
                error: new Error("Only owner can cancel this transaction")
            }

        let updatedTx = await updateEntryById(Transaction, txId, {
            status: 'canceled'
        }, {
            new: true
        });

        updatedTx = await updatedTx.populate('from', '-password');
        updatedTx = await updatedTx.populate('toValue.token');
        updatedTx = await updatedTx.populate('fromValue.token');
        return updatedTx;
    }

    updateTxStatus = async (txId, status) => {
        let updatedTx = await updateEntryById(Transaction, txId, {
            status: status
        }, {
            new: true
        })

        updatedTx = await updatedTx.populate('from', '-password');
        updatedTx = await updatedTx.populate('to', '-password');
        updatedTx = await updatedTx.populate('toValue.token');
        updatedTx = await updatedTx.populate('fromValue.token');

        return updatedTx;
    }

    /**
     * 
     * @param {string} from address of the sender
     * @param {string} to - address of receipient
     * @param {number} value - amount token want to transfer
     * @param {string} SCA - address of the contrart token ERC20
     * @param {string} network - network that contract was deployed
     * @param {string} privateKey - private key of the account to tranfer
     */
    transfer = async (from, to, value, SCA, network, privateKey) => {
        const provider = providers[network];
        const ABI = ERC20TokenContract.abi;

        const decimals = Number(await provider.callFunc(ABI, SCA, 'decimals', [], from));
        const amount = BigInt(value * (10 ** decimals));

        const receipt = await provider.makeTransactionEIP1559(ABI, SCA, 'transfer', [to, amount], from, privateKey);
        console.log(receipt);
        return receipt;
    }
}

export default new TransactionService()