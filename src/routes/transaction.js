import express from 'express'
import txController from '../controllers/TransactionController.js'
import { validate_tx } from '../middlewares/validate_tx.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', txController.getAllTransactions)
router.post('/create', verifyToken, validate_tx, txController.createNewTransaction)
router.patch('/accept/:txId', verifyToken, txController.acceptTransaction)
router.patch('/cancel/:txId', verifyToken, txController.cancelTransaction)

export default router