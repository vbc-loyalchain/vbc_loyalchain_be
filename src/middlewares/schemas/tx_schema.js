import Joi from "joi";

const create_tx_schema = Joi.object({
    to: Joi.string().pattern(new RegExp('^(0x)[0-9|a-f|A-F]{40}$')),

    fromValue: Joi.number().required().min(1),
    fromTokenId: Joi.string().required(),

    toValue: Joi.number().required().min(0),
    toTokenId: Joi.string().required(),

    transactionType: Joi.string().required().valid('transfer', 'exchange'),
})

const get_exchangeTx_schema = Joi.object({
    fromTokenId: Joi.string().min(0),
    fromValueUp: Joi.number().required().min(0).max(10000),
    fromValueDown: Joi.number().required().min(0).max(10000),

    toTokenId: Joi.string().min(0),
    toValueUp: Joi.number().required().min(0).max(10000),
    toValueDown: Joi.number().required().min(0).max(10000),
    page: Joi.number().required().min(1)
})

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

export {
    create_tx_schema,
    get_exchangeTx_schema,
    get_myTx_schema
}