const {
    Schema,
    model
} = require('mongoose');

const CasinoSchema = new Schema({
    userId: String,
    userName: String,
    userNameNoTag: String,
    gameWins: {
        type: Number,
        default: 0
    },
    gameLosses: {
        type: Number,
        default: 0
    },
    totalBet: {
        type: Number,
        default: 0
    },
    totalWon: {
        type: Number,
        default: 0
    },
    totalLost: {
        type: Number,
        default: 0
    },
    Difference: {
        type: Number,
        default: 0
    },
    WheelTimer: {
        type: Date,
        default: new Date(Date.now() - 86400000)
    }
}, {
    collection: 'SueLuz Casino progress'
})

module.exports = model('SueLuz Casino progress', CasinoSchema)