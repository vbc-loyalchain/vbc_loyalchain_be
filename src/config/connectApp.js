import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const connectApp = (app) => {
    const mongoDbUrl = process.env.MONGODB_URL
    const port = process.env.PORT || 5000

    mongoose.connect(mongoDbUrl)
        .then(() => {
            console.log('Connected to MongoDB')
            app.listen(port, (err) => {
                if(err) console.log('Connect to server failed. Try again')
                console.log('Server listening on port: ' + port)
            })
        })
        .catch(err => {
            console.log(err)
        }) 
}  

export default connectApp