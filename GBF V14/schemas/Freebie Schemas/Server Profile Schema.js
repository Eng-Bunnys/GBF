const {
    Schema,
    model
} = require('mongoose');

const nullString = {
    type: String,
    default: null
}

const FreebieProfileSchema = new Schema({
    guildId: String,
    Enabled: Boolean,
    Premium: {
        type: Boolean,
        default: false
    },
    Partner: {
        type: Boolean,
        default: false
    },
    Channel: String,
    Ping: Boolean,
    rolePing: String,
    embedColor: String,
    activeCategory: {
        type: Number,
        default: 0
    },
    useDefault: {
        type: Boolean,
        default: true
    },
    EGSPing: nullString,
    SteamPing: nullString,
    OtherPing: nullString,
    EGSChannel: nullString,
    SteamChannel: nullString,
    OtherChannel: nullString,
    tipMessage: nullString,
    tipTitle: nullString,
    tipFooter: nullString,
    tipBoolean: {
        type: Boolean,
        default: true
    },
    botName: nullString,
    botAvatar: nullString
    /*
    0 : All
    1 : EGS
    2 : Steam
    4 : Other
    7 || 0 : All 
    */
}, {
    collection: 'Freebie Documents'
})

module.exports = model('Freebie Documents', FreebieProfileSchema)