import Joi from "joi";

//create a new transaction
/**
 * If transactionType is exchange, "to" value is null. Otherwise, "to" is address of 
 * the receipient
 */
const create_tx_schema = Joi.object({
    to: Joi.string().pattern(new RegExp('^(0x)[0-9|a-f|A-F]{40}$')),

    fromValue: Joi.number().required().min(1),
    fromTokenId: Joi.string().required(),

    toValue: Joi.number().required().min(0),
    toTokenId: Joi.string().required(),

    transactionType: Joi.string().required().valid('transfer', 'exchange'),
    timelock: Joi.number().min(0),
    hashlock: Joi.string(),
    txIdFrom: Joi.string(),
})

//get all exchange transactions in the market place
const get_exchangeTx_schema = Joi.object({
    fromTokenId: Joi.string().min(0),
    fromValueUp: Joi.number().min(0).default(1000000),
    fromValueDown: Joi.number().min(0).default(0),

    toTokenId: Joi.string().min(0),
    toValueUp: Joi.number().min(0).default(1000000),
    toValueDown: Joi.number().min(0).default(0),
    page: Joi.number().min(1).default(1)
})

//get all my transactions
const get_myTx_schema = Joi.object({
    fromTokenId: Joi.string().min(0),
    fromValueUp: Joi.number().min(0).default(1000000),
    fromValueDown: Joi.number().min(0).default(0),

    toTokenId: Joi.string().min(0),
    toValueUp: Joi.number().min(0).default(1000000),
    toValueDown: Joi.number().min(0).default(0),

    transactionType: Joi.string().valid('all', 'transfer', 'exchange').default('all'),
    page: Joi.number().min(1).default(1)
})

const accept_tx_schema = Joi.object({
    txIdTo: Joi.string().required()
})

export {
    create_tx_schema,
    get_exchangeTx_schema,
    get_myTx_schema,
    accept_tx_schema,
}