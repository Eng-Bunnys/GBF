const {
    Schema,
    model
} = require('mongoose');

const LevelPointsSchema = new Schema({
    userId: String,
    points: {
        type: Number,
        default: 1
    },
    level: {
        type: Number,
        default: 1
    },
    lastXPearned: Date
}, {
    collection: 'Level Point Documents'
})

module.exports = model('Level Point Document', LevelPointsSchema)