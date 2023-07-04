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
        const fromValueUp = parseInt(req.query.fromValueUp);
        const fromValueDown = parseInt(req.query.fromValueDown);
        const toValueUp = parseInt(req.query.toValueUp);
        const toValueDown = parseInt(req.query.toValueDown);
        const page = parseInt(req.query.page);
        let {
            fromTokenId,
            toTokenId
        } = req.query;

        console.log(fromValueUp, fromValueDown, toValueUp, toValueDown)

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
            timelock,
            hashlock,
            txIdFrom // id of transaction in smart contract
        } = req.body;

        const user = req.user;

        if(transactionType === 'transfer' && (toValue !== 0  || fromTokenId !== toTokenId || !to)){
            res.status(400);
            return next(new Error('Invalid request body for transfer transaction'));
        }

        if(transactionType === 'exchange' && (fromTokenId === toTokenId || to || !timelock || !hashlock || !txIdFrom))  {
            res.status(400);
            return next(new Error('Invalid request body for exchange transaction'));
        }

        const [fromToken, toToken] = await Promise.all([
            getById(Token, fromTokenId),
            getById(Token, fromTokenId)
        ])

        if(!fromToken || !toToken) {
            res.status(400);
            return next(new Error('Invalid token'));
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
                paramObj['timelock'] = timelock;
                paramObj['hashlock'] = hashlock;
                paramObj['txIdFrom'] = txIdFrom;
                newTransaction = await this.txService.createExchangeTx(paramObj);
            }
            res.status(201).json(newTransaction);
        } catch (error) {
            next(error)
        }
    }

    //PATCH /api/transactions/:txId/accept
    acceptExchangeTx = async (req, res, next) => {
        const {txId} = req.params;
        const {txIdTo} = req.body;
        try {
            const updatedTx = await this.txService.acceptExchangeTx(txId, req.user, txIdTo);
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

    //PATCH /api/transactions/:txId/cancel
    cancelExchangeTx = async (req, res, next) => {
        const {txId} = req.params;

        try {
            const updatedTx = await this.txService.cancelExchangeTx(txId, req.user);
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

    //PATCH /api/transactions/:txId/progress
    updateExchangeTx = async (req, res, next) => {
        const {txId} = req.params;
        try {
            const tx = await getById(Transaction, txId);
            if(tx.status === 'completed' || tx.status === 'canceled') {
                return next(new Error("Can't update a transaction that has been done"))
            }

            const updatedTx = await this.txService.updateTx(txId, req.body);
            res.status(200).json(updatedTx);
        } catch (error) {
            next(error);
        }
    }
}

export default new TransactionController(txService)