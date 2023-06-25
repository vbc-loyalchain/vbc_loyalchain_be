import jwt from 'jsonwebtoken';
import User from '../models/User'; 
import {getById} from '../repositories';

export const verifyToken = (req, res, next) => {
    let token
    if(req.header('Authorization')) {
        const authInfos = req.header('Authorization').split(' ')

        //check authorization information
        if(authInfos.length !== 2 && authInfos[0] !== 'Bearer'){
            res.status(403)
            return next(new Error('Invalid authorization information'))
        }

        token = authInfos[1]

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if(err) {
                res.status(403)
                return next(err)
            }
            req.user = await getById(User, decoded.id);
            next()
        })
            
    }
    
    if(!token) {
        res.status(403)
        return next(new Error('Unauthorized'));
    }
}