class UserService {
    getUser() {
        return {
            name: 'admin',
            password: '123'
        }
    }
}

export default new UserService()