import Joi from 'joi';

/*
 * get all nft in the marketplace. If user has logged in, network must be specified
 * page number is set by default 1
 */
const get_allNFTInMarket_schema = Joi.object({
    network: Joi.number(),
    upperBoundPrice: Joi.number().default(Infinity),
    lowerBoundPrice: Joi.number().default(0),
    isSelling: Joi.boolean(),
    page: Joi.number().min(1).default(1)
})

const create_nft_schema = Joi.object({
    collectionAddress: Joi.string().required().pattern(new RegExp('^(0x)[0-9|a-f|A-F]{40}$')),
    enterprise: Joi.string().required().pattern(new RegExp('^[0-9a-fA-F]{24}$')),
    NFTId: Joi.number().required().min(1),
})

const update_nft_schema = Joi.object({
    price: Joi.number().min(0),
    isSelling: Joi.boolean()
})

export {
    get_allNFTInMarket_schema,
    create_nft_schema,
    update_nft_schema
}