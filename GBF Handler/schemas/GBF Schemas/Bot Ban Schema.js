const {
    Schema,
    model
} = require('mongoose');

const GBFBotBanSchema = new Schema({
    userId: String,
    reason: String,
    timeOfBan: Date,
    Developer: String
    }, {
    collection: 'GBF Ban Docs'
})

module.exports = model('GBF Ban Docs', GBFBotBanSchema)
