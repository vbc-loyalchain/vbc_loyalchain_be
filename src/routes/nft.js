import express from 'express'
import NFTController from '../controllers/NFTController';
import {validate_getAllNFTInMarket_nft, validate_create_nft, validate_update_nft} from '../middlewares/validate_nft'
import {verifyToken} from '../middlewares/authMiddleware'

const router = express.Router()

router.get('/', validate_getAllNFTInMarket_nft, NFTController.getAllNFTInMarket)
router.post('/', verifyToken, validate_create_nft, NFTController.createNFT)
router.patch('/:id', validate_update_nft, verifyToken, NFTController.updateNFT)
router.delete('/:id', verifyToken, NFTController.deleteNFT)

export default router;