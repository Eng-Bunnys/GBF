const {
    Schema,
    model
} = require('mongoose');

const HeistSchema = new Schema({
    userId: String,
    userName: String,
    userNameNoTag: String,
    ActiveHeist: String,
    HeistPlays: Number,
    MojaveJobHacker: Number,
    MojaveComplete: String,
    ErwenJobCode: String,
    ErweJobProgress: Number,
    ErwenJobLisencePlate: String,
    ErwenJobCarColor: String,
    ErwenUserWeaponChoice: String,
    ErwenCarChoice: String
}, {
    collection: 'SueLuz Heist progress'
})

module.exports = model('SueLuz Heist progress', HeistSchema)