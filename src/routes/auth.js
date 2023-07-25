/**
 * @swagger
 * components:
 *   responses:
 *      UnauthorizedError:
 *          content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                     type: string
 *                     example: "Access token is missing or invalid"
 *                  stack:
 *                     type: string
 *                     example: "Error..."
 *   securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JW
 *   schemas:
 *     Account:
 *       type: object
 *       required:
 *         - _id
 *         - address
 *       properties:
 *         _id:
 *           type: string
 *           description: Id of the account
 *         address:
 *           type: string
 *           description: Address of the wallet account
 *       example:
 *         _id: "64ae51d81e05ee3d7dccbe0e"
 *         address: "0x2032C216cE3B726702E2E8E4b78Ef2aeCC4847D1"
 * 
 * tags:
 *   name: Auth
 *   description: The Authentication managing API
 * /api/auth/login:
 *   post:
 *     summary: Login or register an account if this is the first time you use system
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                 address:
 *                      type: string
 *                      example: "0x2032C216cE3B726702E2E8E4b78Ef2aeCC4847D1"
 *                 signature:
 *                      type: string
 *                      example: "0x2032C216cE3B726702..."
 *                 message:
 *                      type: string
 *                      example: "Hello World" 
 *     responses:
 *       201:
 *         description: Register successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  user:
 *                      $ref: '#/components/schemas/Account'
 *                  accessToken:
 *                      type: string
 *                      example: "eyJhbGciOiJIUzI1N..."
 *       200:
 *         description: Login successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  user:
 *                      $ref: '#/components/schemas/Account'
 *                  accessToken:
 *                      type: string
 *                      example: "eyJhbGciOiJIUzI1N..."
 *       401:
 *         description: Login failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                     type: string
 *                     example: "Invalid credentials"
 *                  stack:
 *                     type: string
 *                     example: "Error..."
 *       500:
 *         description: Login failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                     type: string
 *                     example: "Internal server error"
 *                  stack:
 *                     type: string
 *                     example: "Error..."
 * 
 * /api/auth/token:
 *   get:
 *     summary: Get a new access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Get new access token successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Access token"
 *       403:
 *         description: Login failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                     type: string
 *                     example: "Refresh token expired"
 *                  stack:
 *                     type: string
 *                     example: "Error..."
 *       500:
 *         description: Login failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                     type: string
 *                     example: "Internal server error"
 *                  stack:
 *                     type: string
 *                     example: "Error..."
 *
 */

import express from 'express'
import authController from '../controllers/AuthController.js'
import { validate_login } from '../middlewares/index.js'

const router = express.Router()

router.post('/login', validate_login, authController.login)
router.get('/token', authController.reGenerateToken)

export default router