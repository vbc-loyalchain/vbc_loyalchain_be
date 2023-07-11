import validate_input from "./validate_input";
import { create_nft_schema } from "./schemas/nft_schema";

const validate_create_nft = validate_input(create_nft_schema);

export {
    validate_create_nft
}