import Joi from "joi";

const login_schema = Joi.object({
    address: Joi.string().required().pattern(new RegExp('^(0x)?[0-9|a-f|A-F]{40}$')),
    //privateKey: Joi.string().required().pattern(new RegExp('^(0x)?[0-9|a-f|A-F]{64}$'))
})

export {
    login_schema
}