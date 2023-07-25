import validate_input from "./validate_input.js";
import { get_allNFTInMarket_schema, create_nft_schema, update_nft_schema } from "./schemas/nft_schema.js";

const validate_getAllNFTInMarket_nft = validate_input(get_allNFTInMarket_schema);
const validate_create_nft = validate_input(create_nft_schema);
const validate_update_nft = validate_input(update_nft_schema);

export {
    validate_getAllNFTInMarket_nft,
    validate_create_nft,
    validate_update_nft
}