/**
 * @swagger
 * components:
 *   schemas:
 *     Token:
 *       type: object
 *       required:
 *         - _id
 *         - name
 *         - symbol
 *         - deployedAddress
 *         - network
 *         - image
 *       properties:
 *         _id:
 *           type: string
 *           description: Id of the token
 *         name:
 *           type: string
 *         symbol:
 *           type: string
 *         deployedAddress:
 *           type: string
 *         network:
 *           type: number
 *         image:
 *           type: string
 *           description: Url of the token's image
 * 
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
 *         fromValue:
 *           type: object
 *           properties:
 *               token:
 *                  $ref: '#/components/schemas/Token'
 *               amount:
 *                  type: number
 * 
 *         toValue:
 *           type: object
 *           properties:
 *               token:
 *                  $ref: '#/components/schemas/Token'
 *               amount:
 *                  type: number
 *         transactionType:
 *           type: string
 *         status:
 *           type: string
 *         hashlock:
 *           type: string
 *         contractId:
 *           type: string
 * 
 * 
 * tags:
 *   name: Transaction
 *   description: The Transaction managing API
 * /api/transactions:
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
 *        description: current network
 *      - in: query
 *        name: page
 *        type: number
 *        description: Page number
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *                type: array
 *                items: 
 *                    $ref: '#/components/schemas/Transaction'
 *       500:
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
 * /api/transactions/general:
 *   get:
 *     summary: Get general information about transaction in system
 *     tags: [Transaction]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  total:
 *                      type: number
 *                  total24h:
 *                      type: number
 *                  totalNow:
 *                      type: number
 *       500:
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
 * /api/transactions/rate/{tokenId1}/{tokenId2}:
 *   get:
 *     summary: Get exhange rate between token1 and token2
 *     tags: [Transaction]
 *     parameters:
 *       - in: path
 *         name: tokenId1
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: tokenId2
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *                type: number
 *       500:
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
 * /api/transactions/create:
 *   post:
 *     summary: create a new transaction (transfer or exchange)
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                 to:
 *                      type: string
 *                      description: Id of the receiver (only for exchange transaction)
 *                 fromValue:
 *                      type: number
 *                 fromTokenId:
 *                      type: string
 *                      description: Id of the token
 *                 toValue:
 *                      type: number
 *                 toTokenId:
 *                      type: string
 *                      description: Id of the token
 *                 transactionType:
 *                      type: string
 *                      description: exchange or transfer
 *                 contractId:
 *                      type: string
 *                      description: optional (1 chain)
 *              
 *     responses:
 *       201:
 *         description: Created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Create failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                     type: string
 *                     example: "Invalid credentials"
 *                  stack:
 *                     type: string
 *                     example: "Error..."
 *       401:
 *          $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Create failed.
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
 * /api/transactions/{txId}/secretKey:
 *   get:
 *     summary: Get the secretKey of the Lock contract
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: txId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "abc.."
 *       400:
 *         description: Get secret key failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                     type: string
 *                     example: "Invalid credentials"
 *                  stack:
 *                     type: string
 *                     example: "Error..."
 *       401:
 *          $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Get secret key failed.
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
 * /api/transactions/{txId}/accept:
 *   patch:
 *     summary: accept a exchange transaction
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: txId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                 hashlock:
 *                      type: string
 *                      description: hashlock for the transaction in the contract (only for exchange transaction)
 *     responses:
 *       200:
 *         description: accepted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Accept failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                     type: string
 *                     example: "Invalid credentials"
 *                  stack:
 *                     type: string
 *                     example: "Error..."
 *       401:
 *          $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Accept failed.
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
 * /api/transactions/{txId}/cancel:
 *   patch:
 *     summary: Cancel a exchange transaction
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: txId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: cancel successfully.
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Cancel failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                     type: string
 *                     example: "Invalid credentials"
 *                  stack:
 *                     type: string
 *                     example: "Error..."
 *       401:
 *          $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Cancel failed.
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
 * /api/transactions/{txId}/progress:
 *   patch:
 *     summary: Update status of a exchange transaction
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: txId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                 status:
 *                      type: string
 *                      description: Only accept ['sender accepted', 'receiver withdrawn', 'completed']
 *     responses:
 *       200:
 *         description: updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Updated failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                     type: string
 *                     example: "Invalid credentials"
 *                  stack:
 *                     type: string
 *                     example: "Error..."
 *       401:
 *          $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Updated failed.
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
 * /api/transactions/{txId}/sig/refund:
 *   post:
 *     summary: Get the signature of the admin for refund the transaction
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: txId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                 nonce:
 *                      type: number
 *     responses:
 *       200:
 *         description: updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "0x1b928440d1b5cbc066..."
 *       400:
 *         description: Get signature failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                     type: string
 *                     example: "Invalid credentials"
 *                  stack:
 *                     type: string
 *                     example: "Error..."
 *       401:
 *          $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Get signature failed.
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
    validate_sigForRefundTx,
} from '../middlewares/validate_tx.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

//get all exchange transactions by filter
router.get('/', validate_get_exchangeTx, txController.getAllExchangeTx)

//get general info
router.get('/general', txController.getGeneralInfo)

//get exchange rate between two token
router.get('/rate/:tokenId1/:tokenId2', txController.getExchangeRate)

//create a new transaction
router.post('/create', verifyToken, validate_create_tx, txController.createNewTransaction)

//update exchange transaction when another user accept the transaction
router.get('/:txId/secretKey', verifyToken, txController.getSecretKey)

//update exchange transaction when another user accept the transaction
router.patch('/:txId/accept', verifyToken, validate_accept_tx, txController.acceptExchangeTx)

//cancel the exchange transaction
router.patch('/:txId/cancel', verifyToken, txController.cancelExchangeTx)

//update transaction progress (exchange tx)
router.patch('/:txId/progress', verifyToken, validate_updateExchangeTxStatus, txController.updateExchangeTxStatus)

//return the signature of the admin for refund the transaction
router.post('/:txId/sig/refund', verifyToken, validate_sigForRefundTx, txController.getSignatureForRefund)

export default router