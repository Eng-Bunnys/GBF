const Command = require('../utils/command'); 

module.exports = class CommandNameOrWhatever extends Command {
    constructor(client) {
        super(client, {
            name: "commandname", 
            aliases: [], 
            category: "Utility", 
            description: "", 
            usage: "", 
            examples: "", 
            cooldown: 0, 
            userPermission: [], 
            botPermission: [], 
            devOnly: true, 
            Partner: false, 
        });
    }
    async execute({
        client,
        message,
        args
    }) {
      
    }
}
