import eService from "../services/EnterpriseService.js";

class EnterpriseController {
    constructor(eService) {
        this.eService = eService;
    }

    //[POST] /api/enterprises/join
    joinSystem = async (req, res, next) => {
        try {
            const enterprise = await this.eService.createNewEnterprise(req.body);
            res.status(201).json(enterprise);
        } catch (error) {
            next(error);
        }
    }

    //[GET] /api/enterprises
    getAllEnterpriseInSystem = async (req, res, next) => {
        try {
            const allEnterprise = await this.eService.getAllEnterprise();
            res.status(200).json(allEnterprise);
        } catch (error) {
            next(error)
        }
    }  
}

export default new EnterpriseController(eService)