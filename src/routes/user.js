/**
 * @swagger
 * 
 * tags:
 *   name: User
 *   description: The User managing API
 * /api/users/tx:
 *   get:
 *     summary: Get all transactions of a user by the filter
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
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
 *        name: status
 *        type: number
 *        description: (optional) undefined is get all, 0 is pending, 1 is in progress, 2 is completed
 *      - in: query
 *        name: transactionType
 *        type: string
 *        description: transfer or exchange
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
 *       401:
 *          $ref: '#/components/responses/UnauthorizedError'
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
 * /api/users/nft:
 *   get:
 *     summary: Get all nfts of a user by the filter
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: network
 *        type: number
 *        description: number network of the collection contract
 *      - in: query
 *        name: upperBoundPrice
 *        type: number
 *        description: Upperbound price of the nft
 *      - in: query
 *        name: lowerBoundPrice
 *        type: number
 *        description: Lowerbound price of the nft
 *      - in: query
 *        name: isSelling
 *        type: boolean
 *        description: Is selling in the market or not
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
 *       401:
 *          $ref: '#/components/responses/UnauthorizedError'
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
 * /api/users/recently_transacted:
 *   get:
 *     summary: Get users who recently transacted with a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *                type: array
 *                items: 
 *                    type: string
 *       401:
 *          $ref: '#/components/responses/UnauthorizedError'
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
 * /api/users/mostly_transacted:
 *   get:
 *     summary: Get users who mostly transacted with a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *                type: array
 *                items: 
 *                    type: object
 *                    properties:
 *                      address:
 *                          type: string
 *                      count:
 *                          type: number
 *       401:
 *          $ref: '#/components/responses/UnauthorizedError'
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
 */

import express from 'express'
import userController from '../controllers/UserController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'
import { validate_get_myTx} from '../middlewares/validate_tx.js'
import {validate_getAllNFTInMarket_nft} from '../middlewares/validate_nft.js';

const router = express.Router()

//get all transactions from a user by filter
router.get('/tx', verifyToken, validate_get_myTx, userController.getMyTx);

//get all nfts from a user by filter
router.get('/nft', verifyToken, validate_getAllNFTInMarket_nft, userController.getMyNFT);

router.get('/recently_transacted', verifyToken, userController.getUsersRecentlyTransacted)

router.get('/mostly_transacted', verifyToken, userController.getUsersMostlyTransacted)

export default router