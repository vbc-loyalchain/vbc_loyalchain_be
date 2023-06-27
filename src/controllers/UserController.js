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

    //PATCH /api/users/changePassword
    changePassword = async (req, res, next) => {
        try {
            const {oldPassword, newPassword} = req.body;

            const user = await getById(User, req.user.id)

            if(!user.matchPassword(oldPassword)) {
                res.status(400);
                return next(new Error('Wrong password. Try again'));
            }

            await this.userService.changePassword(user._id, newPassword);
            res.status(204).json({
                message: 'Password changed'
            })

         } catch (error) {
            next(error);
        }
    }
}

export default new UserController(userService)