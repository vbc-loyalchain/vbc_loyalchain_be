import userRouter from './user.js'
import txRouter from './transaction.js'
import authRouter from './auth.js'
import eRouter from './enterprise.js'
import nftRouter from './nft.js'

const route = (app) => {
    app.use('/api/users', userRouter);
    app.use('/api/transactions', txRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/enterprises', eRouter);
    app.use('/api/nfts', nftRouter);
}

export default route