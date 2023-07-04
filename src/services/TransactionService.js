import {create, getById, getOne, getAll, getAllBeforePopulate, updateEntryById} from '../repositories'
import Transaction from "../models/Transaction"
import User from '../models/User';
import Token from '../models/Token';
import { ERC20TokenContract } from "../config/contract/ERC20Token";
import providers from '../config/providers';
import mongoose from 'mongoose';

const PAGE_SIZE = 15;

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
            limit: PAGE_SIZE
        };

        const allExchangeTx = await getAllBeforePopulate(Transaction, filterQuery, null, options)
                                .populate('from')
                                .populate('to')
                                .populate('fromValue.token')
                                .populate('toValue.token')

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

        newTransaction = await newTransaction.populate('from');
        newTransaction = await newTransaction.populate('to')
        newTransaction = await newTransaction.populate('fromValue.token');
        newTransaction = await newTransaction.populate('toValue.token');

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
            hashlock,
            txIdFrom
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
            hashlock,
            txIdFrom
        });

        newTransaction = await newTransaction.populate('from');
        newTransaction = await newTransaction.populate('fromValue.token');
        newTransaction = await newTransaction.populate('toValue.token');

        return newTransaction;
    }

    /**
     * @param {string} txId - Id of the transaction in database
     * @param {object} receiver - request's sender (receiver)
     * @param {string} txIdTo - Id of the transaction in the contract
     */
    acceptExchangeTx = async (txId, receiver, txIdTo) => {
        let tx = await getById(Transaction, txId);
        tx = await tx.populate('fromValue.token');
        tx = await tx.populate('toValue.token');

        //check whether this transaction has been accepted by another user
        if(tx.status !== 'pending'){
            throw {
                statusCode: 400,
                error: new Error("Can't accept a transaction that has been done")
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
            status: tx.fromValue.token.network === tx.toValue.token.network ? 'completed' : 'waiting for sender',
            txIdTo,
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
        tx = await tx.populate('fromValue.token');
        tx = await tx.populate('toValue.token');

        let updateObj;

        //check whether the transaction has been cancelled or completed
        if(tx.status === 'completed' || tx.status === 'canceled')
            throw {
                statusCode: 400,
                error: new Error("Can't cancel a transaction that has been done")
            }
        
        //if status is pending, only owner can cancel this transaction
        if(tx.status === 'pending' && tx.from.toString() !== sender.id)
            throw {
                statusCode: 400,
                error: new Error("Only owner can cancel this transaction")
            }

        //if status is waiting for receiver, only receiver can cancel
        if(tx.status === 'waiting for receiver' && tx.to.toString() !== sender.id)
            throw {
                statusCode: 400,
                error: new Error("Now only receiver can cancel this transaction")
            }

        //if status is waiting for sender, both receiver and owner can cancel, otherwise throw an error.
        if( tx.status === 'waiting for sender' && 
            tx.from.toString() !== sender.id && 
            tx.to.toString() !== sender.id) {
            throw {
                statusCode: 400,
                error: new Error("Don't have permission to cancel this transaction")
            }
        }
        
        if(tx.from.toString() === sender.id) {
            updateObj = {
                status: 'canceled',
            }
        }
        else {
            updateObj = tx.status === 'waiting for receiver' ? {
                status: 'canceled'
            } : {
                to: null,
                status: 'pending',
                txIdTo: null,
            }
        }
                   
        const updatedTx = await this.updateTx(txId, updateObj)

        return updatedTx;
    }

    updateTx = async (txId, updateObj) => {
        let updatedTx = await updateEntryById(Transaction, txId, updateObj, {
            new: true
        })

        updatedTx = await updatedTx.populate('from');
        updatedTx = await updatedTx.populate('to');
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