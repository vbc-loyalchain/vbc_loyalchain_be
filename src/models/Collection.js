import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema({
    name: {type: String, required: true},
    symbol: {type: String, required: true},
    deployedAddress: {type: String, required: true},
    token: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Token'
    }
}, {
    timestamps: true
})

const Collection = mongoose.model('Collection', CollectionSchema)
export default Collection