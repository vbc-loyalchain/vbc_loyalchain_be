import validate_input from "./validate_input";
import { login_schema, change_password_schema } from "./schemas/acc_schema";

const validate_login = validate_input(login_schema);
const validate_change_password = validate_input(change_password_schema);

export { 
    validate_login,
    validate_change_password
}