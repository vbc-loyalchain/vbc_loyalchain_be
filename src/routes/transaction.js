/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - _id
 *         - from
 *         - to
 *         - fromValue
 *         - toValue
 *         - transactionType
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           description: Id of the transaction
 *         from:
 *           $ref: '#/components/schemas/Account'
 *         to:
 *           $ref: '#/components/schemas/Account'
 * 
 *       example:
 *         _id: "64ae51d81e05ee3d7dccbe0e"
 *         address: "0x2032C216cE3B726702E2E8E4b78Ef2aeCC4847D1"
 * 
 * tags:
 *   name: Transaction
 *   description: The Transaction managing API
 * /transactions:
 *   get:
 *     summary: Get all exchange transactions in the market by filter
 *     tags: [Transaction]
 *     parameters:
 *      - in: query
 *        name: fromTokenId
 *        type: string
 *        description: Id of the token want to sell
 *      - in: query
 *        name: toTokenId
 *        type: string
 *        description: Id of the token want to buy
 *      - in: query
 *        name: fromValueUp
 *        type: number
 *        description: Upperbound amount of the token want to sell
 *      - in: query
 *        name: fromValueDown
 *        type: number
 *        description: Lowerbound amount of the token want to sell
 *      - in: query
 *        name: toValueUp
 *        type: number
 *        description: Upperbound amount of the token want to buy
 *      - in: query
 *        name: toValueDown
 *        type: number
 *        description: Lowerbound amount of the token want to buy
 *      - in: query
 *        name: network
 *        type: number
 *        description: Network of the token
 *      - in: query
 *        name: page
 *        type: number
 *        description: Number of the page
 *     responses:
 *       200:
 *         description: Login successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  user:
 *                      $ref: '#/components/schemas/Account'
 *                  accessToken:
 *                      type: string
 *                      example: "eyJhbGciOiJIUzI1N..."
 *       400:
 *         description: Login failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                     type: string
 *                     example: "Bad request"
 *                  stack:
 *                     type: string
 *                     example: "Error..."
 *       500:
 *         description: Login failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                     type: string
 *                     example: "Internal server error"
 *                  stack:
 *                     type: string
 *                     example: "Error..."
 * 
 */

import express from 'express'
import txController from '../controllers/TransactionController.js'
import { 
    validate_create_tx, 
    validate_accept_tx,
    validate_get_exchangeTx, 
    validate_updateExchangeTxStatus,
    validate_refundTx
} from '../middlewares/validate_tx.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

//get all exchange transactions by filter
router.get('/', validate_get_exchangeTx,  txController.getAllExchangeTx)

//get general info
router.get('/general',  txController.getGeneralInfo)

//get exchange rate between two token
router.get('/rate/:tokenId1/:tokenId2', txController.getExchangeRate)

//create a new transaction
router.post('/create', verifyToken, validate_create_tx, txController.createNewTransaction)

//update exchange transaction when another user accept the transaction
router.patch('/:txId/accept', verifyToken, validate_accept_tx, txController.acceptExchangeTx)

//cancel the exchange transaction
router.patch('/:txId/cancel', verifyToken, txController.cancelExchangeTx)

//update transaction progress (exchange tx)
router.patch('/:txId/progress', verifyToken, validate_updateExchangeTxStatus, txController.updateExchangeTxStatus)

//refund token from the transaction and return the signature of the admin
router.post('/:txId/refund', verifyToken, validate_refundTx, txController.refundTx)

export default router