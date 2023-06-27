import Joi from "joi";

const login_schema = Joi.object({
    address: Joi.string().required().pattern(new RegExp('^(0x)[0-9|a-f|A-F]{40}$')),
    password: Joi.string().required().min(5)
})

const change_password_schema = Joi.object({
    oldPassword: Joi.string().required().min(5),
    newPassword: Joi.string().required().min(5),
})

export {
    login_schema,
    change_password_schema
}