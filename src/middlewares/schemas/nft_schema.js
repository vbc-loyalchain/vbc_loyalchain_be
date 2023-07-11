import Joi from 'joi';

const create_nft_schema = Joi.object({
    collectionAddress: Joi.string().required().pattern(new RegExp('^(0x)[0-9|a-f|A-F]{40}$')),
    enterprise: Joi.string().required().pattern(new RegExp('^[0-9a-fA-F]{24}$')),
    NFTId: Joi.number().required().min(0),
    price: Joi.number().required().min(0),
    isSelling: Joi.boolean().default(false)
}) 

export {
    create_nft_schema
}