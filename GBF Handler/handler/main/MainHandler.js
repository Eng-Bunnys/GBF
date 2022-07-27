const { getAllFiles } = require("../util/engine");
const Command = require("./Command");

const path = require("path");
const GBFSlash = require("./SlashCommands");

class GBFHandler {
  commands = new Map();

  constructor(instance, commandsDir, client) {
    this._instance = instance;
    this._commandsDir = commandsDir;
    this._slashCommands = new GBFSlash(client);

    this.readFiles();
    this.messageListener(client);
  }

  readFiles() {
    const files = getAllFiles(this._commandsDir);
    const validations = this.getValidations("syntax");

    for (let file of files) {
      const commandObject = require(file);
      console.log(commandObject);
      let fileName = file.split(/[/\\]/).pop(); //.split(".")[0];

      if (!commandObject.name)
        throw new Error(
          `You need to specify a name for the command in file "${fileName}"`
        );

      let commandName = commandObject.name.toLowerCase();

      const command = new Command(this._instance, commandName, commandObject);

      for (const validation of validations) {
        validation(command);
      }

      const { description, options = [], type, testOnly } = commandObject

      this.commands.set(command.commandName, command);

      if (type === 'SLASH' || type === 'BOTH') {
        if (testOnly) {
          for (const guildId of this._instance.testServers) {
            this._slashCommands.create(
              command.commandName,
              description,
              options,
              guildId
            )
          }
        } else {
          this._slashCommands.create(command.commandName, description, options);
        }
      }
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
    )
      .sort((a, b) => {
        const aNum = a.split(/[/\\]/).pop().split(".")[0];
        const bNum = b.split(/[/\\]/).pop().split(".")[0];
        return aNum - bNum;
      })
      .map((filePath) => require(filePath));
    return validations;
  }
}

module.exports = GBFHandler;
