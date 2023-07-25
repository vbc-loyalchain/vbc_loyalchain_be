import CryptoJS from "crypto-js";
import dotenv from 'dotenv';
import {create, getById, getOne, getAllBeforePopulate, updateEntryById} from '../repositories/index.js'
import Transaction from "../models/Transaction.js"
import User from '../models/User.js';
import providers from '../config/providers.js';
import mongoose from 'mongoose';
import {SwapTwoChainContract} from '../config/variables/index.js';
import {SwapTwoChain} from '../config/contract/SwapTwoChain.js';
dotenv.config();

const PAGE_SIZE = 12;

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

        let allExchangeTx = await getAllBeforePopulate(Transaction, filterQuery, null, {}).populate([
            {path: 'from', select: '_id address'},
            {path: 'to', select: '_id address'},
            {path: 'fromValue.token', select: '-createdAt -updatedAt -__v'},
            {path: 'toValue.token', select: '-createdAt -updatedAt -__v'},
        ])
        .sort('-createdAt');

        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;

        allExchangeTx = allExchangeTx.filter(tx => {
            if(network > 0) {
                return tx.fromValue.token.network === network && tx.toValue.token.network === network;
            }
            if(network === 0) {
                return tx.fromValue.token.network !== tx.toValue.token.network;
            }
            return true;
        }).slice(from, to);

        console.log(allExchangeTx.length);

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
            contractId
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
            contractId
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
     * @param {string} hashlock - Hashlock of the transaction key
     * @param {object} receiver - request's sender (receiver)
     */
    acceptExchangeTx = async (txId, hashlock, receiver) => {
        let tx = await getById(Transaction, txId);

        if(!tx) {
            throw {
                statusCode: 400,
                error: new Error("Transaction not found")
            }
        }

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

        const updatedTx = await this.updateTx(txId, updateObj);

        return updatedTx;
    }

    /**
     * @param {string} txId - Id of the transaction
     * @param {object} sender - request's sender
     * @returns 
     */
    cancelExchangeTx = async (txId, sender) => {
        let tx = await getById(Transaction, txId);

        if(!tx) {
            throw {
                statusCode: 400,
                error: new Error("Transaction not found")
            }
        }

        //check whether the transaction has been cancelled or completed
        if(['receiver withdrawn', 'completed', 'cancelled'].includes(tx.status))
            throw {
                statusCode: 400,
                error: new Error("Can't cancel a transaction that is in progress or has been done")
            }
        
        //if status is pending, only owner can cancel this transaction
        if(['pending', 'receiver cancelled'].includes(tx.status) && tx.from.toString() !== sender.id)
            throw {
                statusCode: 400,
                error: new Error("Now only owner can cancel this transaction")
            }

        //if status is sender cancelled, only receiver can cancel this transaction
        if(tx.status === 'sender cancelled' && tx.to.toString() !== sender.id)
            throw {
                statusCode: 400,
                error: new Error("Now only receiver can cancel this transaction")
            }

        //if status is waiting for receiver, only receiver can cancel
        if((tx.status === 'receiver accepted' || tx.status === 'sender accepted') && 
            (tx.from.toString() !== sender.id && tx.to.toString() !== sender.id))
            throw {
                statusCode: 400,
                error: new Error("Now only owner and receiver can cancel this transaction")
            }

        tx = await tx.populate([
            {path: 'fromValue.token', select: 'network'},
            {path: 'toValue.token', select: 'network'}
        ])

        let updateObj = {}

        if(tx.fromValue.token.network === tx.toValue.token.network) {
            updateObj['status'] = 'cancelled';
        }
        else {
            if(['sender cancelled', 'receiver cancelled', 'pending'].includes(tx.status)){
                updateObj['status'] = 'cancelled';
            }
            else {
                updateObj['status'] = sender.id === tx.from.toString() ? 'sender cancelled' : 'receiver cancelled';
            }
        }
                   
        const updatedTx = await this.updateTx(txId, updateObj);

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
     * @param {*} contractId - Id of the transaction in Blockchain
     * @param {*} callerAddress - Address of the caller who made this request 
     * @param {*} nonce - current nonce of the caller account
     * @param {*} senderNetwork - network of the SwapTwoChain contract which caller created
     * @param {*} receiverNetwork - network of the SwapTwoChain contract which the other created
     */
    getSignatureRefund = async (contractId, callerAddress, nonce, senderNetwork, receiverNetwork) => {
        console.log(contractId)
        const sender_provider = providers[senderNetwork];
        const sender_SCA = SwapTwoChainContract[senderNetwork];

        const receiver_provider = providers[receiverNetwork];
        const receiver_SCA = SwapTwoChainContract[receiverNetwork];

        const senderOrder = await sender_provider.callFunc(SwapTwoChain.abi, sender_SCA, 'transactions', [contractId], callerAddress);
        
        if(parseInt(senderOrder.timelock) >= Math.floor(Date.now() / 1000)) {
            throw {
                statusCode: 400,
                error: new Error('Too early to refund')
            }
        }

        if(senderOrder.status !== '0') {
            throw {
                statusCode: 400,
                error: new Error('Cannot refund from the transaction which was refunded or withdrawn')
            }
        }

        let receiverWithdrawn = false;
        try {
            const receiverOrder = await receiver_provider.callFunc(SwapTwoChain.abi, receiver_SCA, 'transactions', [contractId], callerAddress);
            if(receiverOrder.status === '1') {
                receiverWithdrawn =  true;
            }
        } catch (error) {
            //console.log(error);
        }

        if(receiverWithdrawn) {
            throw {
                statusCode: 400,
                error: new Error('Cannot refund from the transaction because you have been withdrawn from the other')
            }
        }

        const privateKey = CryptoJS.AES.decrypt(
            process.env.PRIVATE_KEY_ENCRYPT,
            process.env.PRIVATE_KEY_SECRET
        ).toString(CryptoJS.enc.Utf8);

        const data = [
            {
                type: "bytes32",
                value: contractId,
            },
            {
                type: "address",
                value: callerAddress,
            },
            {
                type: "uint256",
                value: nonce,
            }
        ];

        const signature = sender_provider.signData(data, privateKey)
        return signature;
    };

    /**
     * @param {string} txId - id of the transaction in database 
     * @param {string} from 
     * @param {string} to 
     * @param {number} network 
     * @returns contractId in smart contract
     */
    getContractId = (txId, from, to) => {
        const provider = providers[4444];
        const txIdHash = provider.WEB3.utils.keccak256(txId);

        const contractId = provider.WEB3.utils.soliditySha3(
            {
                type: "bytes32",
                value: txIdHash,
            },
            {
                type: "address",
                value: from,
            },
            {
                type: "address",
                value: to,
            }
        );

        return contractId;
    }

    /**
     * @param {string} contractId - Id of the transaction in smart contract 
     * @param {string} callerAddress 
     * @param {number} network 
     * @returns key of the transaction in smart contract
     */
    getSecretKey = async (contractId, callerAddress, network) => {
        const provider = providers[network];
        const SCA = SwapTwoChainContract[network];

        const data = await provider.callFunc(SwapTwoChain.abi, SCA, 'transactions', [contractId], callerAddress)

        return data.key; //key
    }
}

export default new TransactionService()