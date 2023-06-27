import Joi from "joi";

const create_tx_schema = Joi.object({
    from: Joi.string().required().pattern(new RegExp('^(0x)[0-9|a-f|A-F]{40}$')),
    fromValue: Joi.number().required().min(1),
    fromToken: Joi.string().required(),
    toValue: Joi.number().required().min(0),
    toToken: Joi.string().required()
})

export {
    create_tx_schema
}