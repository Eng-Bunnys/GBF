const {
  getAllFiles
} = require("../util/engine");
const Command = require("./Command");

const path = require("path");

class GBFHandler {
  commands = new Map();

  constructor(instance, commandsDir, client) {
    this._instance = instance;
    this._commandsDir = commandsDir;
    this.readFiles();
    this.messageListener(client);
  }

  readFiles() {
    const files = getAllFiles(this._commandsDir);
    const validations = this.getValidations("syntax");

    for (let file of files) {
      const commandObject = require(file);

      console.log(commandObject);

      // const commandName = commandObject.name.toLowerCase();

      let commandName = file.split(/[/\\]/).pop().split(".")[0];

      const command = new Command(this._instance, commandName, commandObject);

      for (const validation of validations) {
        validation(command);
      }

      this.commands.set(command.commandName, command);
    }
  }

  messageListener(client) {
    const validations = this.getValidations("run-time");

    const prefix = "!";

    client.on("messageCreate", (message) => {
      if (!message.content.startsWith(prefix)) return;

      const args = message.content.split(/\s+/);
      const commandName = args.shift().substring(prefix.length).toLowerCase();

      const command = this.commands.get(commandName);
      if (!command) return;

      const usage = {
        message,
        args,
        text: args.join(" "),
        guild: message.guild,
      };

      for (const validation of validations) {
        if (!validation(command, usage, prefix)) return;
      }

      const { callback } = command.commandObject;
      callback(usage);
    });
  }

  getValidations(folder) {
    const validations = getAllFiles(
      path.join(__dirname, `./validations/${folder}`)
    ).sort((a, b) => {
        const aNum = a.split(/[/\\]/).pop().split(".")[0];
        const bNum = b.split(/[/\\]/).pop().split(".")[0];
        return aNum - bNum;
      })
      .map((filePath) => require(filePath));
    return validations;
  }
}

module.exports = GBFHandler;
