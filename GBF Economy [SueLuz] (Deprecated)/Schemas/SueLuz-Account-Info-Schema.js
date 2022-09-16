const {
    Schema,
    model
} = require('mongoose');

const MoneySchema = new Schema({
    userId: String,
    userName: String,
    userNameNoTag: String,
    walletBal: Number,
    bankBal: Number,
    netWorth: Number,
    RP: Number,
    Rank: Number,
    Married: {
        type: String,
        default: 'No'
    },
    MarriedRing: {
        type: Number,
        default: 0
    },
    MarriedTo: {
        type: String,
        default: 'No-one'
    },
    MarriedAt: {
        type: String
    },
    DailyStreak: {
        type: Date,
        default: new Date(Date.now() - 86400000)
    },
    StreakCounter: {
        type: Number,
        default: 1
    },
    MarriagePrivate: {
        type: String,
        default: 'No'
    },
    PrivateAccount: {
        type: String,
        default: 'No'
    }
}, {
    collection: 'SueLuz Stats'
})

module.exports = model('SueLuz Stats', MoneySchema)
