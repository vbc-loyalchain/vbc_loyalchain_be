import txService from "../services/TransactionService.js";
import { getById } from "../repositories/crud.js";
import Token from "../models/Token.js";
import Transaction from "../models/Transaction.js";

class TransactionController {
    constructor(txService) {
        this.txService = txService;
    }

    //[GET] /api/transactions/general
    getGeneralInfo = async (req, res, next) => {
        try {
            res.status(200).json(await this.txService.getGeneralInfo());
        } catch (error) {
            next(error)
        }
    }

    //[GET] /api/transactions/
    getAllExchangeTx = async (req, res, next) => {
        const {
            fromValueUp, 
            fromValueDown, 
            toValueUp, 
            toValueDown, 
            page
        } = req.query;
        const network = req.query.network !== undefined ? req.query.network : -1;
        let {
            fromTokenId,
            toTokenId
        } = req.query;

        try {
            if(fromValueUp < fromValueDown || toValueUp < toValueDown) {
                res.status(400);
                return next(new Error('Invalid filter'));
            }
            
            let allExchangeTx = await this.txService.getAllExchangeTx({
                fromTokenId,
                fromValueUp,
                fromValueDown,

                toTokenId,
                toValueUp,
                toValueDown,

                network,
                page
            });

            res.status(200).json(allExchangeTx);
        } catch (error) {
            next(error)
        }
    }

    //[GET] /api/transactions/rate/:tokenId1/:tokenId2
    getExchangeRate = async (req, res, next) => {
        const {tokenId1, tokenId2} = req.params;
        try {
            const rate = await this.txService.exchangeRate(tokenId1, tokenId2);
            res.status(200).json(rate);
        } catch (error) {
            next(error);
        }
    }

    //[POST] /api/transactions/create
    createNewTransaction = async (req, res, next) => {
        const {
            to,
            fromValue,
            fromTokenId,
            toValue, 
            toTokenId,
            transactionType,
            contractIdFrom // id of transaction in smart contract
        } = req.body;

        const user = req.user;

        if(transactionType === 'transfer' && (toValue !== 0  || fromTokenId !== toTokenId || !to)){
            res.status(400);
            return next(new Error('Invalid request body for transfer transaction'));
        }

        if(transactionType === 'exchange' && (fromTokenId === toTokenId || to)) {
            res.status(400);
            return next(new Error('Invalid request body for exchange transaction'));
        }

        const [fromToken, toToken] = await Promise.all([
            getById(Token, fromTokenId),
            getById(Token, toTokenId)
        ])

        if(!fromToken || !toToken) {
            res.status(400);
            return next(new Error('Invalid token'));
        }

        if(transactionType === 'exchange' && fromToken.network === toToken.network && !contractIdFrom)  {
            res.status(400);
            return next(new Error('Invalid request body for exchange transaction'));
        }

        try {
            let newTransaction;
            const paramObj = {
                user,
                fromValue,
                fromTokenId,
                toValue, 
                toTokenId,
            }

            if(transactionType === 'transfer') {
                paramObj['to'] = to;
                newTransaction = await this.txService.createTransferTx(paramObj);
            }
            else{
                paramObj['contractIdFrom'] = contractIdFrom;
                newTransaction = await this.txService.createExchangeTx(paramObj);
            }
            res.status(201).json(newTransaction);
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /api/transactions/:txId/accept
    acceptExchangeTx = async (req, res, next) => {
        const {txId} = req.params;
        try {
            const updatedTx = await this.txService.acceptExchangeTx(txId, req.body, req.user);
            res.status(200).json({
                updatedTx,
                message: 'Accepted successfully'
            })
        } catch (error) {
            if(error.statusCode) {
                res.status(error.statusCode)
                return next(error.error)
            }
            next(error)
        }
    }

    //[PATCH] /api/transactions/:txId/cancel
    cancelExchangeTx = async (req, res, next) => {
        const {txId} = req.params;

        try {
            const updatedTx = await this.txService.cancelExchangeTx(txId, req.user);
            res.status(200).json(updatedTx)
        } catch (error) {
            if(error.statusCode) {
                res.status(error.statusCode)
                return next(error.error)
            }
            next(error);
        }
    }

    //[PATCH] /api/transactions/:txId/progress
    updateExchangeTxStatus = async (req, res, next) => {
        const {txId} = req.params;
        const caller = req.user;
        const newStatus = req.body.status;
        const contractIdFrom = req.body.contractIdFrom;
        
        try {
            const tx = await getById(Transaction, txId);

            switch(tx.status) {
                case 'receiver accepted':
                    if(newStatus !== "sender accepted" || caller.id !== tx.from.toString() || !contractIdFrom){
                        res.status(400);
                        return next(new Error("Invalid updation"));
                    }
                    break;
                case 'sender accepted':
                    if(newStatus !== "receiver withdrawn" || caller.id !== tx.to.toString() || contractIdFrom){
                        res.status(400);
                        return next(new Error("Invalid updation"));
                    }
                    break;
                case 'receiver withdrawn':
                    if(newStatus !== "completed" || caller.id !== tx.from.toString() || contractIdFrom){
                        res.status(400);
                        return next(new Error("Invalid updation"));
                    }
                    break;
                default:
                    res.status(400);
                    return next(new Error("Can't update this transaction's status"));
            }

            const updatedTx = await this.txService.updateTx(txId, req.body);
            res.status(200).json(updatedTx);
        } catch (error) {
            next(error);
        }
    }

    //[POST] /api/transactions/:txId/sig/refund
    getSignatureForRefund = async (req, res, next) => {
        const caller = req.user;
        const {txId} = req.params; // id of transaction in the database
        const {contractId, nonce} = req.body; // id of transaction in blockchain

        try {
            let tx = await getById(Transaction, txId);
            tx = await tx.populate([
                {path: 'fromValue.token', select: 'network'},
                {path: 'toValue.token', select: 'network'}
            ])

            switch(caller.id) {
                case tx.from.toString():
                    if(tx.contractIdFrom !== contractId) {
                        res.status(400);
                        return next(new Error('Invalid transaction information'));
                    }
                    break;
                case tx.to.toString():
                    if(tx.contractIdTo !== contractId) {
                        res.status(400);
                        return next(new Error('Invalid transaction information'));
                    }
                    break;
                default:
                    res.status(403);
                    return next(new Error('You are not the sender or receiver of this transaction'));
            }

            switch(tx.status) {
                case 'receiver accepted':
                    if(tx.to.toString() !== caller.id) {
                        res.status(403);
                        return next(new Error('Now only receiver can refund transaction'));
                    }
                    break;
                case 'sender accepted':
                    break;
                case 'canceled':
                    break;
                default:
                    res.status(403);
                    return next(new Error('Cannot refund from the transaction'));
            }

            const network = tx.from.toString() === caller.id ? tx.fromValue.token.network : tx.toValue.token.network;
            const signature = await this.txService.getSignatureRefund(contractId, caller.address, nonce, network);

            res.status(200).json(signature);
        } catch (error) {
            if(error.statusCode){
                res.status(error.statusCode);
                return next(error.error);
            }
            next(error);
        }
    }
}

export default new TransactionController(txService)