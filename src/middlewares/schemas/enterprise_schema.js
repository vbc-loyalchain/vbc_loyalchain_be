import Joi from "joi";

const enterprise_schema = Joi.object({
    name: Joi.string().required().min(3),
    symbol: Joi.string().required().min(3),
    deployedAddress: Joi.string().required().pattern(new RegExp('^(0x)[0-9|a-f|A-F]{40}$')),
    network: Joi.number().required().min(0),
    image: Joi.string().uri(),
})

export {
    enterprise_schema
}