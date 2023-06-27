import validate_input from "./validate_input";
import { enterprise_schema } from "./schemas/schema_enterprise";

const validate_enterprise = validate_input(enterprise_schema);

export { 
    validate_enterprise,
}