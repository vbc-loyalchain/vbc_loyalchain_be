import authService from "../services/AuthService";

class AuthController {
    constructor(authService) {
        this.authService = authService;
    }    

    //[POST] /api/auth/login
    login = async (req, res, next) => {
        try {
            const {
                user, 
                accessToken,
                refreshToken, 
                isCreated
            } = await this.authService.login(req.body);

            res.cookie(accessToken, refreshToken, {
                httpOnly: true,
                maxAge: 2 * 60 * 60 * 1000
            })

            res.status(isCreated ? 201 : 200).json({
                user,
                accessToken
            });
        } catch (error) {
            res.status(401);
            next(error)
        }
    }

    //[GET] /api/auth/token
    reGenerateToken = async (req, res, next) => {
        try {
            const {accessToken} = req.body;
            const refreshToken = req.cookies[accessToken];
            if(!refreshToken) {
                res.status(403);
                return next(new Error('Refresh token expired'));
            }

            const {newAccessToken, newRefreshToken} = this.authService.reGenerateAccessToken(refreshToken);

            res.clearCookie(accessToken)
            res.cookie(newAccessToken, newRefreshToken, {
                httpOnly: true,
                maxAge: 2 * 60 * 60 * 1000
            })

            res.status(200).json({
                accessToken: newAccessToken
            })
        } catch (error) {
            res.status(403)
            next(error)
        }
    }
}

export default new AuthController(authService)