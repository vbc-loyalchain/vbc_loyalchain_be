import express from 'express'
import NFTController from '../controllers/NFTController';
import {validate_create_nft} from '../middlewares/validate_nft'
import {verifyToken} from '../middlewares/authMiddleware'

const router = express.Router()

router.get('/', NFTController.getAllNFT)
router.post('/', verifyToken, validate_create_nft, NFTController.createNFT)

export default router;