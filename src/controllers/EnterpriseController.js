import eService from "../services/EnterpriseService";

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
}

export default new EnterpriseController(eService)