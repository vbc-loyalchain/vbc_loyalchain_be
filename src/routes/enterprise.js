import express from 'express'
import eController from '../controllers/EnterpriseController'
import { validate_enterprise } from '../middlewares'

const router = express.Router()

router.post('/join', validate_enterprise, eController.joinSystem)

export default router