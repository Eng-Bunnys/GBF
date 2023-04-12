/**
 * @warning Discord generally is against legacy message commands, it is not recommended to use legacy commands
 */

const { msToTime, missingPermissions } = require("../../utils/Engine");
const {
  Collection,
  EmbedBuilder,
  Events,
  PermissionFlagsBits
} = require("discord.js");
const cooldowns = new Collection();

const { Developers, PREFIX, Partners } = require("../../config/GBFconfig.json");

const blacklistSchema = require("../../schemas/GBF Schemas/Bot Ban Schema");
const guildConfigs = require("../../schemas/GBF Schemas/Prefix Schema");

module.exports = (client) => {
  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || message.channel.type === "DM") return;

    const blacklistFetch = await blacklistSchema.findOne({
      userId: message.author.id
    });

    const DBGuild = await guildConfigs.findOne({
      guildId: message.guild.id
    });

    if (!DBGuild) {
      let prefixDoc = new guildConfigs({
        guildId: message.guild.id
      });

      await prefixDoc.save().catch((e) => {
        console.log("Error:", e);
      });
    }

    const prefix = DBGuild ? DBGuild.prefix : PREFIX;
    if (!message.content.startsWith(prefix)) return;

    const [cmd, ...args] = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/);

    const command =
      client.commands.get(cmd.toLowerCase()) ||
      client.commands.get(client.aliases.get(cmd.toLowerCase()));

    if (!command) return;

    const suspendedEmbed = new EmbedBuilder()
      .setTitle(`${emojis.ERROR}`)
      .setDescription(
        `You have been banned from using ${client.user.username}.`
      )
      .setColor(colours.ERRORRED)
      .setThumbnail(
        "https://cdn.discordapp.com/emojis/855834957607075850.gif?v=1"
      );

    if (blacklistFetch && blacklistFetch.Blacklist) {
      const userBlacklist = message.channel;
      if (
        userBlacklist &&
        userBlacklist.viewable &&
        userBlacklist
          .permissionsFor(message.guild.members.me)
          .has(PermissionFlagsBits.SendMessages)
      ) {
        return userBlacklist
          .send({
            embeds: [suspendedEmbed]
          })
          .catch(() => {});
      }
    }

    if (command.devOnly && !Developers.includes(message.author.id)) {
      const DevOnly = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} You can't use that`)
        .setDescription("This command is only available for developers.")
        .setColor(colours.ERRORRED);

      const targetChannel = message.channel;
      if (
        targetChannel &&
        targetChannel.viewable &&
        targetChannel
          .permissionsFor(message.guild.members.me)
          .has(PermissionFlagsBits.SendMessages)
      ) {
        return targetChannel
          .send({
            embeds: [DevOnly]
          })
          .catch(() => {});
      }
    }

    if (command.Partner && !Partners.includes(message.author.id)) {
      const PartnerOnly = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} You can't use that`)
        .setDescription(`This command is only available for partners.`)
        .setColor(colours.ERRORRED);

      const targetChannel = message.channel;
      if (
        targetChannel &&
        targetChannel.viewable &&
        targetChannel
          .permissionsFor(message.guild.members.me)
          .has(PermissionFlagsBits.SendMessages)
      ) {
        return targetChannel
          .send({
            embeds: [PartnerOnly]
          })
          .catch(() => {});
      }
    }

    if (command.canNotDisable === Boolean) return;

    if (
      command.userPermission &&
      !message.member.permissions.has(command.userPermission, true)
    ) {
      const UserPerms = new MessageEmbed()
        .setTitle("Missing Permissions")
        .setDescription(
          `${
            message.author.username
          }, You are missing the following permissions: ${missingPermissions(
            message.member,
            command.userPermission
          )}`
        )
        .setColor("#e91e63");
      const channel = message.channel;
      if (
        channel &&
        channel.viewable &&
        channel
          .permissionsFor(message.guild.members.me)
          .has(PermissionFlagsBits.SendMessages)
      ) {
        return channel
          .send({
            embeds: [UserPerms]
          })
          .catch(() => {});
      }
    }

    if (
      command.botPermission &&
      !message.channel
        .permissionsFor(message.guild.members.me)
        .has(command.botPermission, true)
    ) {
      const BotPerms = new MessageEmbed()
        .setTitle("Missing Permission")
        .setDescription(
          `${
            message.author.username
          }, I am missing the following permissions: \`${missingPermissions
            .map((perm) => `${perm.replace("_", " ")}`)
            .join(", ")}\``
        )
        .setColor("#e91e63");

      const channel = message.channel;
      if (
        channel &&
        channel.viewable &&
        channel
          .permissionsFor(message.guild.members.me)
          .has(PermissionFlagsBits.SendMessages)
      ) {
        return channel
          .send({
            embeds: [BotPerms]
          })
          .catch(() => {});
      }
    }

    const cd = command.cooldown;
    if (cd) {
      if (!cooldowns.has(command.name))
        cooldowns.set(command.name, new Collection());

      const now = Date.now();
      const timestamps = cooldowns.get(command.name);
      const cooldownAmount = cd * 1000;

      if (timestamps.has(message.author.id)) {
        const expirationTime =
          timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
          const cooldownembed = new MessageEmbed()
            .setDescription(
              `${message.author}, please wait ${msToTime(
                expirationTime - now
              )} before reusing the \`${cmd}\` command.`
            )
            .setColor("#e91e63");

          const cooldownchannel = message.channel;
          if (
            cooldownchannel &&
            cooldownchannel.viewable &&
            cooldownchannel
              .permissionsFor(message.guild.members.me)
              .has(PermissionFlagsBits.SendMessages)
          ) {
            return cooldownchannel
              .send({
                embeds: [cooldownembed]
              })
              .catch(() => {});
          }
        }
      }
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }
  });
};
