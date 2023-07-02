import userService from "../services/UserService.js";
import { getById } from "../repositories/crud.js";
import User from '../models/User.js'

class UserController {
    constructor(userService) {
        this.userService = userService;
    }    

    //[GET] /api/users/:address
    getUser = (req, res, next) => {
        console.log(req.user)
        return res.status(200).json(this.userService.getUser())
    }

    //GET /api/users/:userId/transactions
    getMyTx = async (req, res, next) => {
        const userId = req.params.userId;
        if(userId !== req.user.id) {
            res.status(403);
            return next(new Error('Forbidden'));
        }

        const fromValueUp = parseInt(req.query.fromValueUp);
        const fromValueDown = parseInt(req.query.fromValueDown);
        const toValueUp = parseInt(req.query.toValueUp);
        const toValueDown = parseInt(req.query.toValueDown);
        const page = parseInt(req.query.page);
        let {
            fromTokenId,
            toTokenId,
            transactionType
        } = req.query;

        try {
            if(fromValueUp < fromValueDown || toValueUp < toValueDown) {
                res.status(400);
                return next(new Error('Invalid filter'));
            }
            
            const myTx = await this.userService.getMyTx(
                userId,
                {
                    fromTokenId,
                    fromValueUp,
                    fromValueDown,

                    toTokenId,
                    toValueUp,
                    toValueDown,

                    transactionType,
                    page
                }
            );

            res.status(200).json(myTx);
        } catch (error) {
            next(error)
        }
    }
}

export default new UserController(userService)