const {
  msToTime,
  missingPermissions,
  delay
} = require("../utils/engine")
const {
  Collection,
  MessageEmbed,
  Permissions
} = require("discord.js")
const cooldowns = new Collection();
const guildConfigs = require("../schemas/prefix-schemas");

const {
  Developers,
  PREFIX,
  Partners
} = require('../config/GBFconfig.json')

const blacklistSchema = require('../schemas/GBF Schemas/Bot Ban Schema');
const GuildSchema = require("../schemas/guild-schemas")
const errors = require('../gbferrors.json')
const moment = require("moment")

module.exports = (client) => {
  client.on("messageCreate", async (message) => {

    if (message.author.bot || message.channel.type === 'DM') return;

    const blacklistFetch = await blacklistSchema.findOne({
      userId: message.author.id
    });

    const DBGuild = await guildConfigs.findOne({
      guildId: message.guild.id
    })

    if (!DBGuild) {
      let prefixDoc = new guildConfigs({
        guildId: message.guild.id,
        prefix: "!!"
      });

      await prefixDoc.save().catch(e => {
        console.log("Error:", e)
      })
    }


    const commandsStuff = await GuildSchema.findOne({
      gId: message.guild.id
    })

    if (!commandsStuff) {
      let commandsDoc = new GuildSchema({
        gId: message.guild.id,
        disabledCommands: []
      });

      await commandsDoc.save().catch(e => {
        console.log("Error:", e)
      })
    }

    const prefix = DBGuild ? DBGuild.prefix : PREFIX
    if (!message.content.startsWith(prefix)) return;

    const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/);

    const command = client.commands.get(cmd.toLowerCase()) || client.commands.get(client.aliases.get(cmd.toLowerCase()));

    if (!command) return;

    let suspendgif = "https://cdn.discordapp.com/emojis/855834957607075850.gif?v=1"

    const suspendedembed = new MessageEmbed()
    .setTitle(`${emojis.ERROR}`)
    .setDescription(
      `You have been banned from using ${client.user.username}, if you think this is a mistake, please contact support.`
    )
    .setColor(colours.ERRORRED)
    .setThumbnail(suspendgif);

    if (blacklistFetch && blacklistFetch.Blacklist) {
      const userBlacklist = message.channel
      if (userBlacklist && userBlacklist.viewable && userBlacklist.permissionsFor(message.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
        return userBlacklist.send({
          embeds: [suspendedembed]
        }).catch(() => {});
      }
    }

    const disabledcommandembed = new MessageEmbed()
      .setTitle("ALERT")
      .setDescription("This command has been disabled in this server")
      .setColor("#FF0000")

    if (commandsStuff.disabledCommands.includes(command.name)) {
      const disableChannel = message.channel
      if (disableChannel && disableChannel.viewable && disableChannel.permissionsFor(message.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
        return disableChannel.send({
          embeds: [disabledcommandembed]
        }).catch(() => {});
      }
    }

    if (command.GBFDev && !Developers.includes(message.author.id)) {
      const devonlyembed = new MessageEmbed()
        .setDescription("Only Developers can use this command!\nThe current developers are <@333644367539470337>, <@365647018393206785>")
        .setColor("#e91e63")

      const devonlything = message.channel
      if (devonlything && devonlything.viewable && devonlything.permissionsFor(message.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
        return devonlything.send({
          embeds: [devonlyembed]
        }).catch(() => {});
      }
    }

    if (command.Partner && !Partners.includes(message.author.id)) {
      const PartnerOnly = new MessageEmbed()
        .setDescription(`This command is partner only\nIf you would like to become a partner please run ${PREFIX}partnerhelp`)
        .setColor("#e91e63")

      const partnerchannelony = message.channel
      if (partnerchannelony && partnerchannelony.viewable && partnerchannelony.permissionsFor(message.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
        return partnerchannelony.send({
          embeds: [PartnerOnly]
        }).catch(() => {});
      }
    }

    if (command.canNotDisable === Boolean) {
      return;
    }

    if (command.userPermission && !message.member.permissions.has(command.userPermission, true)) {

      const permissionembed = new MessageEmbed()
        .setTitle("Missing Permissions")
        .setDescription(`${message.author.username}, You are missing the following permissions: ${missingPermissions(message.member, command.userPermission)}`)
        .setColor("#e91e63")
      const channel = message.channel
      if (channel && channel.viewable &&
        channel.permissionsFor(message.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
        return channel.send({
          embeds: [permissionembed]
        }).catch(() => {});

      }
    }


    if (command.botPermission && !message.channel.permissionsFor(message.guild.me).has(command.botPermission, true)) {

      const botpermissionembed = new MessageEmbed()
        .setTitle("Missing Permission")
        .setDescription(`${message.author.username}, I am missing the following permissions: \`${missing.map(perm => `${perm.replace('_', ' ')}`).join(', ')}\``)
        .setColor("#e91e63")
      const channel1 = message.channel
      if (channel1 && channel1.viewable &&
        channel1.permissionsFor(message.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
        return channel1.send({
          embeds: [botpermissionembed]
        }).catch(() => {});
      }
    }

    const cd = command.cooldown;
    if (cd) {
      if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Collection());


      const now = Date.now();
      const timestamps = cooldowns.get(command.name);
      const cooldownAmount = cd * 1000;

      if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
          const cooldownembed = new MessageEmbed()
            .setDescription(`${message.author}, please wait ${msToTime(expirationTime - now)} before reusing the \`${cmd}\` command.`)
            .setColor("#e91e63")
          const cooldownchannel = message.channel
          if (cooldownchannel && cooldownchannel.viewable &&
            cooldownchannel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) {
            return cooldownchannel.send({
              embeds: [cooldownembed]
            }).catch(() => {});
          }
        }

      }
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    const saver2 = await client.channels.fetch("885652845523791892").catch(() => null)

    const {
      guild
    } = message

    let today = new Date();

    let time = moment(today).format("hh:mm:ss")

    let date = moment(today).format("MM/DD/YYYY")

    const commandranembed = new MessageEmbed()

      .setTitle("A command has been ran")
      .setColor("#e91e63")
      .setDescription(`The command **${command.name}** has been ran by **${message.author.tag}** in **${guild.name}** at **${time}, ${date}**`)

    try {
      await command.execute({client, message, args})
      saver2.send({
        embeds: [commandranembed]
      }).catch(() => {});

    } catch (err) {
      console.log(`I ran into an error running "${command.name}" Error:`, err);
      const errorembed = new MessageEmbed()
        .setTitle(`It looks like I've ran into an error 😦`)
        .setDescription(`> Here is the full error, it has already been reported to my developers:\n \`\`\`js\n${err}\`\`\`\n`)
        .setColor("#ff0015")
      const errorchannel = message.channel
      if (errorchannel && errorchannel.viewable && errorchannel.permissionsFor(message.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
       return
          // return errorchannel.send({
       //   embeds: [errorembed]
      //  }).catch(() => {});
      }
    }
  })
}
