const getAllFiles = require("../../utils/getFiles");
const Command = require("./Command");
const path = require('path');

class GBFHandler {
  commands = new Map();
  constructor(commandsDir, client) {
    this.commandsDir = commandsDir;
    this.readFiles();
    this.messageListener(client);
  }
  readFiles() {
    const files = getAllFiles(this.commandsDir);

    for (const file of files) {
      const commandObject = require(file);

      let commandName = file.split(/[/\\]/);
      commandName = commandName.pop().split(".")[0];

      const command = new Command(commandName, commandObject);

      this.commands.set(command.commandName, command);
    }
  }

  messageListener(client) {
    const validations = getAllFiles(path.join(__dirname, "./validations/run time")).map((filePath) => require(filePath));
    const prefix = "!"
    client.on("messageCreate", (message) => {
      if (!message.content.startsWith(prefix)) return;

      const args = message.content.split(/\s+/);
      const commandName = args.shift().substring(prefix.length).toLowerCase();

      const command = this.commands.get(commandName);

      if (!command) return;

      const {
        callback
      } = command.commandObject;

      const usage = {
        message,
        args,
        text: args.join(" "),
      }

      for (const validation of validations) {
        if (!validation(command, usage, prefix)) return;
      }
      callback(usage);
    });

  }
}
module.exports = GBFHandler;
