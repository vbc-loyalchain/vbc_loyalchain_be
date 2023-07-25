import nftService from "../services/NFTService.js";

class NFTController {
    constructor(nftService) {
        this.nftService = nftService;
    }

    getAllNFTInMarket = async (req, res, next) => {
        try {
            const allNFTInMarket = await this.nftService.getAllNFTInMarket(req.query);
            res.status(200).json(allNFTInMarket);
        } catch (error) {
            if(error.statusCode) {
                res.status(error.statusCode);
                return next(error.error);
            }
            next(error);
        }
    }

    //[POST] /api/ntfs
    createNFT = async(req, res, next) => {
        try {
            const newNFT = await this.nftService.createNewNFT(req.body, req.user);
            res.status(201).json(newNFT)         
        } catch (error) {
            if(error.statusCode) {
                res.status(error.statusCode)
                return next(error.error)
            }
            next(error);
        }
    }

    //[PATCH] /api/nfts/:id
    updateNFT = async (req, res, next) => {
        const caller = req.user;
        const {price, isSelling} = req.body;
        const updateObj = {}
        if(price !== undefined) updateObj.price = price;
        if(isSelling !== undefined) updateObj.isSelling = isSelling;

        try {
            const updatedNFT = await this.nftService.updateNFT(req.params.id, caller, updateObj);
            res.status(200).json(updatedNFT);
        } catch (error) {
            if(error.statusCode) {
                res.status(error.statusCode);
                return next(error.error);
            }
            next(error);
        }
    }

    //[DELETE] /api/nfts/:id
    deleteNFT = async (req, res, next) => {
        const caller = req.user;
        try {
            await this.nftService.deleteNFT(req.params.id, caller);
            res.status(200).json({
                message: `delete nft ${req.params.id} successfully`
            })
        } catch (error) {
            if(error.statusCode) {
                res.status(error.statusCode);
                return next(error.error);
            }
            next(error);
        }
    }
}

export default new NFTController(nftService);