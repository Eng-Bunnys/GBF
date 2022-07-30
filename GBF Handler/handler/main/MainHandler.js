const { getAllFiles } = require("../util/engine");
const Command = require("./Command");

const { InteractionType } = require("discord.js");

const path = require("path");
const GBFSlash = require("./SlashCommands");

class GBFHandler {
  _commands = new Map();
  _validations = this.getValidations("run-time");
  _prefix = "!";

  constructor(instance, commandsDir, client) {
    this._instance = instance;
    this._commandsDir = commandsDir;
    this._slashCommands = new GBFSlash(client);

    this.readFiles();
    this.messageListener(client);
    this.interactionListener(client);
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

      const { description, options = [], type, testOnly } = commandObject;

      this._commands.set(command.commandName, command);

      if (type === "SLASH" || type === "BOTH") {
        if (testOnly) {
          for (const guildId of this._instance.testServers) {
            this._slashCommands.create(
              command.commandName,
              description,
              options,
              guildId
            );
          }
        } else {
          this._slashCommands.create(command.commandName, description, options);
        }
      }
    }
  }

  async runCommand(commandName, args, message, interaction) {
    const command = this._commands.get(commandName);
    if (!command) return;

    const { callback, type } = command.commandObject;

    if (message && type === "SLASH") return;

    const usage = {
      message,
      interaction,
      args,
      text: args.join(" "),
      guild: message ? message.guild : interaction.guild,
    };

    for (const validation of this._validations) {
      if (!validation(command, usage, this._prefix)) return;
    }

    return await callback(usage);
  }

  messageListener(client) {
    client.on("messageCreate", async (message) => {
      const { content } = message;

      if (!content.startsWith(this._prefix)) {
        return;
      }

      const args = content.split(/\s+/);
      const commandName = args
        .shift()
        .substring(this._prefix.length)
        .toLowerCase();

      const response = await this.runCommand(commandName, args, message);
      if (response)  message.reply(response).catch(() => {});
    });
  }

  interactionListener(client) {
    client.on('interactionCreate', async (interaction) => {
      if (interaction.type !== InteractionType.ApplicationCommand) return;

      const args = ['5', '10']

      const response = await this.runCommand(
        interaction.commandName,
        args,
        null,
        interaction
      )
      if (response) {
        interaction.reply(response).catch(() => {})
      }
    })
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
