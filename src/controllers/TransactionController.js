import txService from "../services/TransactionService.js";
import { getById } from "../repositories/crud.js";
import Token from "../models/Token.js";
import Transaction from "../models/Transaction.js";

class TransactionController {
    constructor(txService) {
        this.txService = txService;
    }

    //[GET] /api/transactions/
    getAllExchangeTx = async (req, res, next) => {
        const fromValueUp = parseInt(req.query.fromValueUp);
        const fromValueDown = parseInt(req.query.fromValueDown);
        const toValueUp = parseInt(req.query.toValueUp);
        const toValueDown = parseInt(req.query.toValueDown);
        const page = parseInt(req.query.page);
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

                page
            });

            res.status(200).json(allExchangeTx);
        } catch (error) {
            next(error)
        }
    }

    //[GET] /api/transactions/:userId
    getMyTx = async (req, res, next) => {
        const userId = req.params.userId;
        if(userId !== req.user.id) {
            res.status(403);
            return next(new Error('Forbidden'));
        }

        const fromValueUp = parseInt(req.query.fromValueUp);
        const fromValueDown = parseInt(req.query.fromValueDown);
        const toValueUp = parseInt(req.query.toValueUp);
        const toValueDown = parseInt(req.query.toValueDown);
        const page = parseInt(req.query.page);
        let {
            fromTokenId,
            toTokenId,
            transactionType
        } = req.query;

        try {
            if(fromValueUp < fromValueDown || toValueUp < toValueDown) {
                res.status(400);
                return next(new Error('Invalid filter'));
            }
            
            const myTx = await this.txService.getMyTx(
                userId,
                {
                    fromTokenId,
                    fromValueUp,
                    fromValueDown,

                    toTokenId,
                    toValueUp,
                    toValueDown,

                    transactionType,
                    page
                }
            );

            res.status(200).json(myTx);
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

        if(transactionType === 'exchange' && (fromTokenId === toTokenId || to))  {
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
    acceptExchangeTx = async (req, res, next) => {
        const {txId} = req.params;
        const {address} = req.user;
        try {
            const updatedTx = await this.txService.acceptExchangeTx(txId, address);
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
    cancelExchangeTx = async (req, res, next) => {
        const {txId} = req.params;
        const {address} = req.user;

        try {
            const updatedTx = await this.txService.cancelExchangeTx(txId, address);
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

    ////PATCH /api/transactions//transfer/update/:txId
    updateTransferTxStatus = async (req, res, next) => {
        const {status} = req.body;
        const {txId} = req.params;
        const userId = req.user.id;

        try {
            const tx = await getById(Transaction, txId);
            if(!tx || tx.status !== 'pending' || tx.from.toString() !== userId || tx.transactionType !== 'transfer'){
                res.status(400);
                return next(new Error('Invalid updation'))
            }

            const updatedTx = await this.txService.updateTx(txId, {status});
            res.status(200).json(updatedTx);
        } catch (error) {
            next(error)
        }
    }
}

export default new TransactionController(txService)