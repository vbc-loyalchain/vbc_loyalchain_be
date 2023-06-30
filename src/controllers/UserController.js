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
}

export default new UserController(userService)