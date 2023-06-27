import mongoose from "mongoose";

const NFTSchema = new mongoose.Schema({
    tokenID: {
        type: Number,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
        required: true
    }
}, {
    timestamps: true
})

const NFT = mongoose.model('NFT', NFTSchema)
export default NFT