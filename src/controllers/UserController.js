import userService from "../services/UserService.js";

class UserController {
    constructor(userService) {
        this.userService = userService;
    }    

    //GET /api/users/tx
    getMyTx = async (req, res, next) => {
        const {
            fromValueUp, 
            fromValueDown, 
            toValueUp, 
            toValueDown, 
        } = req.query;
        let {
            
        } = req.query;

        try {
            if(fromValueUp < fromValueDown || toValueUp < toValueDown) {
                res.status(400);
                return next(new Error('Invalid filter'));
            }
            
            const myTx = await this.userService.getMyTx(
                req.user.id,
                req.query
            );

            res.status(200).json(myTx);
        } catch (error) {
            next(error)
        }
    }

    //[GET] /api/users/nft
    getMyNFT = async (req, res, next) => {
        try {
            const myNFT = await this.userService.getMyNFT(req.user.id, req.query);
            res.status(200).json(myNFT)
        } catch (error) {
            if(error.statusCode) {
                res.status(error.statusCode);
                return next(error.error);
            }
            next(error)
        }
    }

    //[GET] /api/users/recently_transact
    getUsersRecentlyTransacted = async (req, res, next) => {
        try {
            const user = req.user;
            const recently_users = await this.userService.getUsersRecentlyTransacted(user.id);
            res.status(200).json(recently_users);
        } catch (error) {
            next(error);
        } 
    }

    //[GET] /api/users/mostly_transacted
    getUsersMostlyTransacted = async (req, res, next) => {
        try {
            const user = req.user;
            const mostly_users = await this.userService.getUsersMostlyTransacted(user.id);
            res.status(200).json(mostly_users);
        } catch (error) {
            next(error)
        }
    }
}

export default new UserController(userService)