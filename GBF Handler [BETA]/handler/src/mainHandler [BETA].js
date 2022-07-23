const getAllFiles = require("../utils/getFiles");

class GBFHandler {
    commands = new Map()
    constructor(commandsDir, client) {
        this.commandsDir = commandsDir;
        this.readFiles();
        this.messageListener(client)
    }
    readFiles() {
        const files = getAllFiles(this.commandsDir);

        for (const file of files) {
            const commandObject = require(file);

            let commandName = file.split(/[/\\]/);
            commandName = commandName.pop().split('.')[0];

            if (!commandObject.callback) throw new Error(`You must provide a callback function for {commandName}`);

            this.commands.set(commandName.toLowerCase(), commandObject);

        }
    }

    messageListener(client) {
        client.on("messageCreate", (message) => {
            if (!message.content.startsWith("!")) return;

            const args = message.content.split(/\s+/);
            const commandName = args.shift().substring(1).toLowerCase();

            const commandObject = this.commands.get(commandName);

            if (!commandObject) return;

            const { callback } = commandObject;

            callback({ message });

        })
    }
}
module.exports = GBFHandler;
