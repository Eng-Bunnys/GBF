const {
    Schema,
    model
} = require('mongoose');

const FreebieUsesSchema = new Schema({
    ID: {
        type: String,
        default: "GBFFreebie"
    },
    Uses: Number
}, {
    collection: 'Freebie Uses Documents'
})

module.exports = model('Freebie Uses Documents', FreebieUsesSchema)