const {
    Schema,
    model
} = require('mongoose');

const CollectionSchema = new Schema({
    userId: String,
    userName: String,
    userNameNoTag: String,
    ringType: {
        type: Number,
        default: 0
    },
    rings: {
        type: Array,
        default: []
    }
}, {
    collection: 'SueLuz Collection progress'
})

module.exports = model('SueLuz Collection progress', CollectionSchema)