import express from 'express'
import userController from '../controllers/UserController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'
import { validate_get_myTx} from '../middlewares/validate_tx.js'
import {validate_getAllNFTInMarket_nft} from '../middlewares/validate_nft.js';

const router = express.Router()

//get all transactions from a user by filter
router.get('/transactions', verifyToken, validate_get_myTx, userController.getMyTx);

//get all nfts from a user by filter
router.get('/nfts', verifyToken, validate_getAllNFTInMarket_nft, userController.getMyNFT);

router.get('/:address', verifyToken, userController.getUser);

export default router