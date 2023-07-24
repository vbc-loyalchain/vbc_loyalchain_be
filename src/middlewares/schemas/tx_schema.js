import Joi from "joi";

//create a new transaction
/**
 * If transactionType is exchange, "to" value is null. Otherwise, "to" is address of 
 * the receipient
 */
const create_tx_schema = Joi.object({
    to: Joi.string().pattern(new RegExp('^(0x)[0-9|a-f|A-F]{40}$')),

    fromValue: Joi.number().required().greater(0),
    fromTokenId: Joi.string().required().pattern(new RegExp('^[0-9a-fA-F]{24}$')),

    toValue: Joi.number().required().min(0),
    toTokenId: Joi.string().required().pattern(new RegExp('^[0-9a-fA-F]{24}$')),

    transactionType: Joi.string().required().valid('transfer', 'exchange'),
    contractId: Joi.string().pattern(new RegExp('^(0x)[0-9|a-f|A-F]{64}$')),
})

const accept_tx_schema = Joi.object({
    hashlock: Joi.string(),
})

//get all exchange transactions in the market place
const get_exchangeTx_schema = Joi.object({
    fromTokenId: Joi.string().min(0),
    fromValueUp: Joi.number().min(0).default(Infinity),
    fromValueDown: Joi.number().min(0).default(0),

    toTokenId: Joi.string().min(0),
    toValueUp: Joi.number().min(0).default(Infinity),
    toValueDown: Joi.number().min(0).default(0),
    network: Joi.number(),
    page: Joi.number().min(1).default(1)
})

//get all my transactions
const get_myTx_schema = Joi.object({
    fromTokenId: Joi.string().min(0),
    fromValueUp: Joi.number().min(0).default(Infinity),
    fromValueDown: Joi.number().min(0).default(0),

    toTokenId: Joi.string().min(0),
    toValueUp: Joi.number().min(0).default(Infinity),
    toValueDown: Joi.number().min(0).default(0),

    transactionType: Joi.string().valid('all', 'transfer', 'exchange').default('all'),
    status: Joi.number(),
    page: Joi.number().min(1).default(1)
})

const update_exchangeTxStatus_schema = Joi.object({
    status: Joi.string().required().valid('sender accepted', 'receiver withdrawn', 'completed'),
})

const sigForRefund_tx_schema = Joi.object({
    nonce: Joi.number().required().min(0)
})

export {
    create_tx_schema,
    accept_tx_schema,
    get_exchangeTx_schema,
    get_myTx_schema,
    update_exchangeTxStatus_schema,
    sigForRefund_tx_schema,
}