import User from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { getOne, create } from "../repositories";
import jwt from "jsonwebtoken";

class AuthService {
    register = async(address, password) => {
        const newUser = await create(User, {
            address,
            password
        });
        return newUser;
    }

    login = async (body) => {
        const {address, password} = body;
        let isCreated = false;

        let user = await getOne(User, {
            address
        });

        if(!user) {
            user = await this.register(address, password);
            isCreated = true;
        }

        if(!isCreated && !user.matchPassword(password)){
            throw {
                statusCode: 401,
                error: new Error('Invalid credentials')
            };
        }

        const {accessToken, refreshToken} = this.genTokens({
            id: user._id,
            address: user.address
        });

        return {
            user,
            accessToken,
            refreshToken,
            isCreated
        }
    }

    genTokens = (payload) => {
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        
        return {
            accessToken,
            refreshToken
        }
    }

    reGenerateAccessToken = (refreshToken) => {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const tokens = this.genTokens({
            id: decoded.id,
            address: decoded.address
        });

        console.log(tokens)

        return {
            newAccessToken: tokens.accessToken,
            newRefreshToken: tokens.refreshToken
        };
    }
}

export default new AuthService()