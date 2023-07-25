import validate_input from "./validate_input.js";
import { enterprise_schema } from "./schemas/enterprise_schema.js";

const validate_enterprise = validate_input(enterprise_schema);

export { 
    validate_enterprise,
}