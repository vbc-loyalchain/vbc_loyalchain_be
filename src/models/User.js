import mongoose from "mongoose";
import CryptoJS  from 'crypto-js'
import dotenv from 'dotenv'

dotenv.config()

const userSchema = new mongoose.Schema({
    address: {type: String, required: true},
    password: {type: String, required: true}
}, {
    timestamps: true
})

userSchema.methods.matchPassword = function (enteredPassword) {
    return CryptoJS.AES.decrypt(this.password, process.env.PRIVATE_KEY_SECRET).toString(CryptoJS.enc.Utf8) === enteredPassword;
}

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    
    this.password = CryptoJS.AES.encrypt(this.password, process.env.PRIVATE_KEY_SECRET).toString();
})

userSchema.pre('findOneAndUpdate', async function (next) {
    if (!this._update.password)
        return next()
    
    this._update.password = CryptoJS.AES.encrypt(this._update.password, process.env.PRIVATE_KEY_SECRET).toString();
})

const User = mongoose.model('User', userSchema)
export default User