import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    address: {type: String, required: true},
    //privateKeyHash: {type: String, required: true}
}, {
    timestamps: true
})

// userSchema.methods.matchPrivateKey = async function (privateKey) {
//     return await bcrypt.compare(privateKey, this.privateKeyHash);
// }

// userSchema.pre('save', async function (next) {
//     if(!this.isModified('privateKeyHash')) return next();
    
//     const salt = await bcrypt.genSalt(10);
//     this.privateKeyHash = await bcrypt.hash(this.privateKeyHash, salt);
// })

const User = mongoose.model('User', userSchema)
export default User