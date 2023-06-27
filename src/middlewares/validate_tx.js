import validate_input from "./validate_input";
import { create_tx_schema } from "./schemas";

const validate_tx = validate_input(create_tx_schema);

export {
    validate_tx
}
