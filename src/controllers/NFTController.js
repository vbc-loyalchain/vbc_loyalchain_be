import nftService from "../services/NFTService";

class NFTController {
    constructor(nftService) {
        this.nftService = nftService;
    }

    getAllNFT = async (req, res, next) => {
        res.status(200).json("OK");
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
}

export default new NFTController(nftService);