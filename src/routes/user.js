import express from 'express'
import userController from '../controllers/UserController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'
import {  
    validate_get_myTx,
} from '../middlewares/validate_tx.js'

const router = express.Router()

router.get('/:address', verifyToken, userController.getUser)

//get all transactions from a user by filter
router.get('/:userId/transactions', verifyToken, validate_get_myTx, userController.getMyTx)

export default router