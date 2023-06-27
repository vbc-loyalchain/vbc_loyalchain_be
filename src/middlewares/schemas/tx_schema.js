import Joi from "joi";

const create_tx_schema = Joi.object({
    to: Joi.string().pattern(new RegExp('^(0x)[0-9|a-f|A-F]{40}$')),
    fromValue: Joi.number().required().min(1),
    fromTokenId: Joi.string().required(),
    toValue: Joi.number().required().min(0),
    toTokenId: Joi.string().required(),
    transactionType: Joi.string().required().valid('transfer', 'exchange'),
})

export {
    create_tx_schema
}