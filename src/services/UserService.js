import { getAllBeforePopulate } from "../repositories";
import User from "../models/User";
import Transaction from "../models/Transaction";

const PAGE_SIZE = 15;

class UserService {
    getUser() {
        return {
            name: 'admin',
            password: '123'
        }
    }

    getMyTx = async (userId, filter) => {
        const {
            fromTokenId,
            fromValueUp,
            fromValueDown,

            toTokenId,
            toValueUp,
            toValueDown,

            transactionType,
            page
        } = filter;

        const filterQuery = {
            $or: [
                {from: {$eq: userId}},
                {to: {$eq: userId}},
            ],
            'fromValue.amount': {
                $gte: fromValueDown,
                $lte: fromValueUp
            },

            'toValue.amount': {
                $gte: toValueDown,
                $lte: toValueUp
            },
            transactionType: transactionType === 'all' ? {
                $in: ['exchange', 'transfer']
            } : transactionType
        };

        if(fromTokenId) filterQuery['fromValue.token'] = fromTokenId;
        if(toTokenId) filterQuery['toValue.token'] = toTokenId;

        const options = {
            skip: (page - 1) * PAGE_SIZE,
            limit: PAGE_SIZE
        };

        const myTx = await getAllBeforePopulate(Transaction, filterQuery, null, options)
                                .populate('from')
                                .populate('to')
                                .populate('fromValue.token')
                                .populate('toValue.token')

        return myTx;
    }
}

export default new UserService()