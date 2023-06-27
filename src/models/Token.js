import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    symbol: {type: String, required: true, unique: true},
    deployedAddress: {type: String, required: true},
    network: {type: String, required: true, enum: ['MBC', 'AGD']},
    image: {type: String}
}, {
    timestamps: true
})

tokenSchema.path('name').validate(async (value) => {
    const enterpriseCount = await mongoose.models.Token.countDocuments({name: value });
    return !enterpriseCount;
}, 'Enterprise name already exists');

tokenSchema.path('symbol').validate(async (value) => {
    const symbolCount = await mongoose.models.Token.countDocuments({symbol: value });
    return !symbolCount;
}, 'Symbol already exists');

const Token = mongoose.model('Token', tokenSchema)
export default Token