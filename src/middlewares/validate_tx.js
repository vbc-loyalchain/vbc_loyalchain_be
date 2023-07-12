import validate_input from "./validate_input";
import { 
    create_tx_schema, 
    get_exchangeTx_schema, 
    get_myTx_schema,
    accept_tx_schema,
} from "./schemas";

const validate_create_tx = validate_input(create_tx_schema);
const validate_get_exchangeTx = validate_input(get_exchangeTx_schema);
const validate_get_myTx = validate_input(get_myTx_schema);
const validate_accept_tx = validate_input(accept_tx_schema);

export {
    validate_create_tx,
    validate_get_exchangeTx,
    validate_get_myTx,
    validate_accept_tx
}
