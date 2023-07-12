import mongoose from "mongoose";

const NFTSchema = new mongoose.Schema({
    collectionAddress: {
        type: String,
        required: true
    },
    enterprise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Token',
        required: true
    },
    NFTId: {
        type: Number,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        min: 0,
        required: true,
        default: 0
    },
    isSelling: {
        type: Boolean,
        required: true,
        default: false
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
})

const NFT = mongoose.model('NFT', NFTSchema)
export default NFT