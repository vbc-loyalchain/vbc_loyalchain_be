import { updateEntryById } from "../repositories";
import User from "../models/User";

class UserService {
    getUser() {
        return {
            name: 'admin',
            password: '123'
        }
    }
}

export default new UserService()