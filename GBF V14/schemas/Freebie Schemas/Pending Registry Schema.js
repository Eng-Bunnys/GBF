const {
    Schema,
    model
} = require('mongoose');

const FreebieRegisterSchema = new Schema({
    guildId: String,
    Timestamp: Date,
    ID: String,
    Automatic: Boolean
}, {
    collection: 'Freebie Register Documents'
})

module.exports = model('Freebie Register Documents', FreebieRegisterSchema)