import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    symbol: {type: String, required: true, unique: true},
    deployedAddress: {type: String, required: true},
    network: {type: Number, required: true},
    image: {type: String}
}, {
    timestamps: true
})

tokenSchema.path('name').validate(async (value) => {
    const enterpriseCount = await mongoose.models.Token.countDocuments({name: value });
    return !enterpriseCount;
}, 'Token name already exists');

tokenSchema.path('symbol').validate(async (value) => {
    const symbolCount = await mongoose.models.Token.countDocuments({symbol: value });
    return !symbolCount;
}, 'Symbol already exists');

const Token = mongoose.model('Token', tokenSchema)
export default Token