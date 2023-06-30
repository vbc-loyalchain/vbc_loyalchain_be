import express from 'express'
import authController from '../controllers/AuthController'
import { validate_login } from '../middlewares'

const router = express.Router()

router.post('/login', validate_login, authController.login)
router.post('/token', authController.reGenerateToken)

export default router