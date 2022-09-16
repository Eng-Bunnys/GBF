const {
    Schema,
    model
} = require('mongoose');

const GamingSchema = new Schema({
    userId: String,
    userName: String,
    userNameNoTag: String,
    introComplete: String,
    storyChoice: String,
    storyProgress: Number,
    heistProgress: Number,
    normalProgress: Number,
    hybridProgess: Number,
    Respect: {
        type: Number,
        default: "0"
    }
}, {
    collection: 'SueLuz Story progress'
})

module.exports = model('SueLuz Story progress', GamingSchema)