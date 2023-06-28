import express from 'express'
import txController from '../controllers/TransactionController.js'
import { 
    validate_create_tx, 
    validate_get_exchangeTx, 
    validate_get_myTx,
    validate_update_transferTxStatus
} from '../middlewares/validate_tx.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', validate_get_exchangeTx,  txController.getAllExchangeTx)
router.get('/:userId', verifyToken, validate_get_myTx, txController.getMyTx)
router.post('/create', verifyToken, validate_create_tx, txController.createNewTransaction)

//update exchange transaction when another user accept the transaction
router.patch('/accept/:txId', verifyToken, txController.acceptExchangeTx)

//cancel the exchange transaction
router.patch('/cancel/:txId', verifyToken, txController.cancelExchangeTx)

//update status of the transaction when transfer successfully
router.patch('/transfer/update/:txId', verifyToken, validate_update_transferTxStatus, txController.updateTransferTxStatus)

//update status of the transaction when exchange successfully
// router.patch('/exchange/update/:txId', verifyToken, txController.updateTransactionStatus)

export default router