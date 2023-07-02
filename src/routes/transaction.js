import express from 'express'
import txController from '../controllers/TransactionController.js'
import { 
    validate_create_tx, 
    validate_get_exchangeTx, 
    validate_update_transferTxStatus
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
router.patch('/accept/:txId', verifyToken, txController.acceptExchangeTx)

//cancel the exchange transaction
router.patch('/cancel/:txId', verifyToken, txController.cancelExchangeTx)

//update status of the transaction when transfer successfully
router.patch('/transfer/update/:txId', verifyToken, validate_update_transferTxStatus, txController.updateTransferTxStatus)

//update status of the transaction when exchange successfully
// router.patch('/exchange/update/:txId', verifyToken, txController.updateTransactionStatus)

export default router