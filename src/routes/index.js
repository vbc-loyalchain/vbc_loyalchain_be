import userRouter from './user.js'
import txRouter from './transaction.js'
import authRouter from './auth.js'
import eRouter from './enterprise.js'

const route = (app) => {
    app.use('/api/users', userRouter)
    app.use('/api/transactions', txRouter)
    app.use('/api/auth', authRouter)
    app.use('/api/enterprises', eRouter)
}

export default route