import express from 'express'
import txController from '../controllers/TransactionController.js'
import { 
    validate_create_tx, 
    validate_get_exchangeTx, 
    validate_accept_tx
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
router.patch('/:txId/progress', verifyToken, txController.updateExchangeTx)

export default router