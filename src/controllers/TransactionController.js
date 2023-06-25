import txService from "../services/TransactionService.js";

class TransactionController {
    constructor(txService) {
        this.txService = txService;
    }

    //[GET] /api/transactions/
    getAllTransactions = (req, res, next) => {
        return this.txService.getAllTransactions()
    }
}

export default new TransactionController(txService)