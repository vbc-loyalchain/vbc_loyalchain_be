import Joi from "joi";

const enterprise_schema = Joi.object({
    name: Joi.string().required().min(3),
    symbol: Joi.string().required().min(3),
    network: Joi.string().required().valid('AGD', 'MBC'),
    image: Joi.string(),
    admins: Joi.array().items(Joi.string().required().pattern(new RegExp('^(0x)[0-9|a-f|A-F]{40}$'))).required().min(1),
    privateKey: Joi.string().required().pattern(new RegExp('^(0x)[0-9|a-f|A-F]{64}$'))
})

export {
    enterprise_schema
}