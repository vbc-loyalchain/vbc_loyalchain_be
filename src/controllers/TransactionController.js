import txService from "../services/TransactionService.js";
import { getById } from "../repositories/crud.js";
import Token from "../models/Token.js";
import Transaction from "../models/Transaction.js";

class TransactionController {
    constructor(txService) {
        this.txService = txService;
    }

    //[GET] /api/transactions/
    getAllTransactions = (req, res, next) => {
        return this.txService.getAllTransactions()
    }

    //POST /api/transactions/create
    createNewTransaction = async (req, res, next) => {
        const {
            to,
            fromValue,
            fromTokenId,
            toValue, 
            toTokenId,
            transactionType,
        } = req.body;

        const {address} = req.user;

        if(transactionType === 'transfer' && (toValue !== 0  || fromTokenId !== toTokenId || !to)){
            res.status(400);
            return next(new Error('Invalid transaction'));
        }

        if(transactionType === 'exchange' && fromTokenId === toTokenId)  {
            res.status(400);
            return next(new Error('Invalid transaction'));
        }

        const fromToken = await getById(Token, fromTokenId);
        const toToken = await getById(Token, fromTokenId);

        if(!fromToken || !toToken) {
            res.status(400);
            return next(new Error('Invalid token'));
        }

        try {
            const newTransaction = await this.txService.createNewTransaction({
                from: address,
                to,
                fromValue,
                fromTokenId,
                toValue, 
                toTokenId,
                transactionType,
            });
            res.status(201).json(newTransaction);
        } catch (error) {
            next(error)
        }
    }

    //PATCH /api/transactions/accept/:txId
    acceptTransaction = async (req, res, next) => {
        const {txId} = req.params;
        const {address} = req.user;
        try {
            const updatedTx = await this.txService.acceptTransaction(txId, address);
            res.status(200).json({
                updatedTx,
                message: 'Transaction completed'
            })
        } catch (error) {
            if(error.statusCode) {
                res.status(error.statusCode)
                return next(error.error)
            }
            next(error)
        }
    }

    //PATCH /api/transactions/cancel/:txId
    cancelTransaction = async (req, res, next) => {
        const {txId} = req.params;
        const {address} = req.user;

        try {
            const updatedTx = await this.txService.cancelTransaction(txId, address);
            res.status(200).json({
                updatedTx,
                message: 'Transaction cancelled'
            })
        } catch (error) {
            if(error.statusCode) {
                res.status(error.statusCode)
                return next(error.error)
            }
            next(error);
        }
    }
}

export default new TransactionController(txService)