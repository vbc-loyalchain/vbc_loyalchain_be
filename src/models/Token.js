import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    name: {type: String, required: true},
    symbol: {type: String, required: true},
    deployedAddress: {type: String, required: true},
    RPCEndpoint: {type: String, required: true},
    chainId: {type: Number, required: true}
}, {
    timestamps: true
})

const Token = mongoose.model('Token', tokenSchema)
export default Token