import express from 'express'
import userController from '../controllers/UserController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/:address', verifyToken, userController.getUser)

export default router