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
    signedTxFrom: Joi.string(),
    txIdFrom: Joi.string(),
})

//get all exchange transactions in the market place
const get_exchangeTx_schema = Joi.object({
    fromTokenId: Joi.string().min(0),
    fromValueUp: Joi.number().required().min(0).max(10000),
    fromValueDown: Joi.number().required().min(0).max(10000),

    toTokenId: Joi.string().min(0),
    toValueUp: Joi.number().required().min(0).max(10000),
    toValueDown: Joi.number().required().min(0).max(10000),
    page: Joi.number().required().min(1)
})

//get all my transactions
const get_myTx_schema = Joi.object({
    fromTokenId: Joi.string().min(0),
    fromValueUp: Joi.number().required().min(0).max(10000),
    fromValueDown: Joi.number().required().min(0).max(10000),

    toTokenId: Joi.string().min(0),
    toValueUp: Joi.number().required().min(0).max(10000),
    toValueDown: Joi.number().required().min(0).max(10000),

    transactionType: Joi.string().required().valid('all', 'transfer', 'exchange'),
    page: Joi.number().required().min(1)
})

const cancel_tx_schema = Joi.object({
    signedCancelTx: Joi.string().required()
})

const accept_tx_schema = Joi.object({
    signedTxTo: Joi.string().required(),
    txIdTo: Joi.string().required()
})

export {
    create_tx_schema,
    get_exchangeTx_schema,
    get_myTx_schema,
    cancel_tx_schema,
    accept_tx_schema,
}