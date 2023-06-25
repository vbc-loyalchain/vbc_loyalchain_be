import validate_input from "./validate_input";
import { login_schema } from "./schemas/schema_acc";

const validate_login = validate_input(login_schema);

export { 
    validate_login,
}