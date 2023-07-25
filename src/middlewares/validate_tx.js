import validate_input from "./validate_input.js";
import { 
    create_tx_schema,
    accept_tx_schema,
    get_exchangeTx_schema, 
    get_myTx_schema,
    update_exchangeTxStatus_schema,
    sigForRefund_tx_schema,
} from "./schemas/index.js";

const validate_create_tx = validate_input(create_tx_schema);
const validate_accept_tx = validate_input(accept_tx_schema);
const validate_get_exchangeTx = validate_input(get_exchangeTx_schema);
const validate_get_myTx = validate_input(get_myTx_schema);
const validate_updateExchangeTxStatus = validate_input(update_exchangeTxStatus_schema);
const validate_sigForRefundTx = validate_input(sigForRefund_tx_schema);

export {
    validate_create_tx,
    validate_accept_tx,
    validate_get_exchangeTx,
    validate_get_myTx,
    validate_updateExchangeTxStatus,
    validate_sigForRefundTx,
}
