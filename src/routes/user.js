import express from 'express'
import userController from '../controllers/UserController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'
import {validate_change_password} from '../middlewares/index.js'

const router = express.Router()

router.get('/:address', verifyToken, userController.getUser)
router.patch('/changePassword', validate_change_password, verifyToken, userController.changePassword)

export default router