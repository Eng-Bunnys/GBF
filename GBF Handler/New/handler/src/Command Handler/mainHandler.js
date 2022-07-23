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
    const validations = this.getValidations("syntax");

    for (const file of files) {
      const commandObject = require(file);

      let commandName = file.split(/[/\\]/);
      commandName = commandName.pop().split(".")[0];

      const command = new Command(commandName, commandObject);

      for (const validation of validations) {
        validation(command);
      }

      this.commands.set(command.commandName, command);
    }
  }

  messageListener(client) {
    const validations = this.getValidations("run time");
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
  getValidations(folder) {
    const validations = getAllFiles(path.join(__dirname, `./validations/${folder}`)).map((filePath) => require(filePath));
    return validations;
  }
}
module.exports = GBFHandler;
