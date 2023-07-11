import express from 'express'
import cookies from 'cookie-parser'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { connectApp } from './config/index.js'
import route from './routes/index.js'
import { notFound, errorHandler } from './middlewares'
import redisClient from './config/redis.js';

dotenv.config()

/*****************************Config application*******************************/
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('combined'))
app.use(cors({
    origin: [
        'http://localhost:3000',
    ],
    credentials: true
}))
app.use(cookies(process.env.COOKIE_SECRET))
/******************************************************************************/

//Connect to the database and start the server
connectApp(app)
//routing for application
route(app)

app.get('/cache/clear', async (req, res, next) => {
    await redisClient.del('enterprises');
    res.status(200).json('OK');
})

// app.get('/test1', (req, res, next) => {
//     res.cookie('vcl', 1234);
//     console.log(req.cookies)
//     res.status(200).json(req.cookies)
// })

//ERROR Handler middleware
app.use(notFound)
app.use(errorHandler)

