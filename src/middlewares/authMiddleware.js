import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 
import {getById} from '../repositories/index.js';
import dotenv from 'dotenv';
dotenv.config();

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
            const user = await getById(User, decoded.id);
            req.user = {
                id: user._id.toString(),
                address: user.address,
            }
            next()
        })
            
    }
    
    if(!token) {
        res.status(403)
        return next(new Error('Unauthorized'));
    }
}