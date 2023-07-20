import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    fromValue: {
        token: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Token',
            required: true
        },
        amount: {type: Number, required: true, min: 0},
    },
    toValue: {
        token: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Token',
            required: true
        },
        amount: {type: Number, required: true, min: 0},
    },
    transactionType: {
        type: String,
        enum: ['transfer', 'exchange'],
        default: 'transfer',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'receiver accepted', 'sender accepted', 'receiver withdrawn', 'completed', 'canceled'],
        default: 'created',
        required: true
    },
    //timelock: {type: Number},
    key: {type: String},
    hashlock: {type: String},
    contractIdFrom: {type: String},
    contractIdTo: {type: String},
}, {
    timestamps: true
})

const Transaction = mongoose.model('Transaction', transactionSchema)
export default Transaction