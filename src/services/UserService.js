import { updateEntryById } from "../repositories";
import User from "../models/User";

class UserService {
    getUser() {
        return {
            name: 'admin',
            password: '123'
        }
    }

    changePassword = async (userId, newPassword) => {
        await updateEntryById(User, userId, {
            password: newPassword
        })

        console.log('Updated password')
    }
}

export default new UserService()