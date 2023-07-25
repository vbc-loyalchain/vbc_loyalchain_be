import validate_input from "./validate_input.js";
import { login_schema } from "./schemas/acc_schema.js";

const validate_login = validate_input(login_schema);

export { 
    validate_login,
}