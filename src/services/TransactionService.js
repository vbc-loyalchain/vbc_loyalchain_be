import {create, getById, getOne, updateEntryById} from '../repositories'
import Transaction from "../models/Transaction"
import Token from "../models/Token";
import { ERC20TokenContract } from "../config/contract/ERC20Token";
import providers from '../config/providers';
import User from '../models/User';

class TransactionService {
    getAllTransactions() {
        return [1,2,3,4,5]
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
        
        const newTransaction = await create(Transaction, {
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
            status: transactionType === 'transfer' ? 'completed' : 'pending'
        });

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

    updateTransaction = async (txId, receipientAddress) => {
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

    cancelTransaction = async (txId, senderAddress) => {
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

        updatedTx = await updatedTx.populate('from', '-password')
        updatedTx = await updatedTx.populate('toValue.token')
        updatedTx = await updatedTx.populate('fromValue.token')
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