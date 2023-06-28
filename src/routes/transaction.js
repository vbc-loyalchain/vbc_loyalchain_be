import express from 'express'
import txController from '../controllers/TransactionController.js'
import { validate_create_tx, validate_get_exchangeTx, validate_get_myTx} from '../middlewares/validate_tx.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', validate_get_exchangeTx,  txController.getAllExchangeTx)
router.get('/:userId', validate_get_myTx, verifyToken, txController.getMyTx)
router.post('/create', verifyToken, validate_create_tx, txController.createNewTransaction)
router.patch('/accept/:txId', verifyToken, txController.acceptTransaction)
router.patch('/cancel/:txId', verifyToken, txController.cancelTransaction)

export default router