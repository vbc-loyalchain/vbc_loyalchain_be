import userService from "../services/UserService.js";

class UserController {
    constructor(userService) {
        this.userService = userService;
    }    

    //[GET] /api/users/:address
    getUser = (req, res, next) => {
        return res.status(200).json(this.userService.getUser())
    }
}

export default new UserController(userService)