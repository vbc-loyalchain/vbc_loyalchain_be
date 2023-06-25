import express from 'express'
import txController from '../controllers/transactionController.js'

const router = express.Router()

router.get('/', txController.getAllTransactions)

export default router