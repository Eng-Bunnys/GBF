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
    this._client = client;
    this._instance = instance;
    this._commandsDir = commandsDir;
    this._slashCommands = new GBFSlash(client);

    this.readFiles();
    this.messageListener(client);
    this.interactionListener(client);
  }

  async readFiles() {
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

      const {
        description,
        type,
        testOnly,
        disabled: del,
        aliases = [],
        init = () => {},
      } = commandObject;

      if (del) {
        if (type === "SLASH" || type === "BOTH") {
          if (testOnly) {
            for (const guildId of this._instance.testServers) {
              this._slashCommands.delete(command.commandName, guildId);
            }
          } else this._slashCommands.delete(command.commandName);
        }
        continue;
      }

      for (const validation of validations) validation(command);

      await init(this._client, this._instance);

      const names = [command.commandName, ...aliases];

      for (const name of names) this._commands.set(name, command);

      if (type === "SLASH" || type === "BOTH") {
        const options =
          commandObject.options ||
          this._slashCommands.creatOptions(commandObject);

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

  async runCommand(command, args, message, interaction) {
    const { callback, type } = command.commandObject;

    if (message && type === "SLASH") return;

    const usage = {
      message,
      interaction,
      args,
      text: args.join(" "),
      guild: message ? message.guild : interaction.guild,
      user: message ? message.author : interaction.user,
      member: message ? message.member : interaction.member,
    };

    for (const validation of this._validations) {
      if (!validation(command, usage, this._prefix)) return;
    }

    return await callback(usage);
  }

  messageListener(client) {
    client.on("messageCreate", async (message) => {
      if (message.author.bot || message.channel.type === "DM") return;
      if (!message.content.startsWith(this._prefix)) return;

      const args = message.content.split(/\s+/);
      const commandName = args
        .shift()
        .substring(this._prefix.length)
        .toLowerCase();

      const command = this._commands.get(commandName);
      if (!command) return;

      const { reply, deferReply } = command.commandObject;

      if (deferReply) message.channel.sendTyping();

      const response = await this.runCommand(command, args, message);
      if (!response) return;

      if (reply) message.reply(response).catch(() => {});
      else message.channel.send(response).catch(() => {});
    });
  }

  interactionListener(client) {
    client.on("interactionCreate", async (interaction) => {
      if (interaction.channel.type === "DM") return;
      if (interaction.type !== InteractionType.ApplicationCommand) return;

      const args = interaction.options.data.map(({ value }) => {
        return String(value);
      });

      const command = this._commands.get(interaction.commandName);
      if (!command) return;

      const { deferReply } = command.commandObject;

      if (deferReply) await interaction.deferReply({
        ephemeral: deferReply === 'ephemeral'
      });

      const response = await this.runCommand(
       command,
        args,
        null,
        interaction
      );
      if (!response) return;

      if (deferReply) interaction.editReply(response).catch(() => {});
      else interaction.reply(response).catch(() => {});
      
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
