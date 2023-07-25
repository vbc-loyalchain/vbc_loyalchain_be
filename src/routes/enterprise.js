import express from 'express';
import eController from '../controllers/EnterpriseController.js';
import { validate_enterprise } from '../middlewares/index.js';

const router = express.Router()

router.get('/', eController.getAllEnterpriseInSystem)
router.post('/join', validate_enterprise, eController.joinSystem)

export default router