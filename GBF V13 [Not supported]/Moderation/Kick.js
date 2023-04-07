const {
    MessageEmbed
} = require("discord.js");
const SlashCommand = require("../../utils/slashCommands");

const title = require("../../gbfembedmessages.json");
const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

module.exports = class KickCommand extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "kick",
            category: "Moderation",
            description: "Kick a user from this server",
            usage: "/kick <user>",
            examples: "/kick @Bunnys",

            options: [{
                name: "user",
                description: "The user that you want to kick",
                type: "USER",
                required: true,
            }, {
                name: "reason",
                description: "Reason for the kick",
                type: "STRING",
                required: false,
            }],

            devOnly: false,
            userPermission: ["KICK_MEMBERS"],
            botPermission: ["KICK_MEMBERS"],
            cooldown: 0,
            development: true,
            Partner: false,
        });
    }

    async execute({
        client,
        interaction
    }) {

        const target = interaction.options.getUser('user');
        const kickReason = interaction.options.getString('reason');

        const GuildMember = interaction.guild.members.cache.get(target.id);
        const moderator = interaction.user;

        if (GuildMember) {

            const SelfKick = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(`You can't kick yourself...\nJust leave the server nerd 🤓`)
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });

            if (moderator.id == target.id) return interaction.reply({
                embeds: [SelfKick],
                ephemeral: true,
            });

            const BotKick = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(`I can't kick myself...`)
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });

            if (target.id === client.user.id) return interaction.reply({
                embeds: [BotKick],
                ephemeral: true,
            });

            const UnableToKick = new MessageEmbed()
                .setTitle(`${emojis.ERROR} I can't do that`)
                .setDescription(`I can't kick an admin...`)
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });

            if (GuildMember.permissions.has("ADMINISTRATOR")) return interaction.reply({
                embeds: [UnableToKick],
                ephemeral: true,
            });

            const targetPosition = GuildMember.roles.highest.position;
            const authorPosition = interaction.member.roles.highest.position;
            const botPosition = interaction.guild.me.roles.highest.position;

            const TargetHigher = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(`${target.username}'s position is higher or equal to yours`)
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });

            if (authorPosition <= targetPosition) return interaction.reply({
                embeds: [TargetHigher],
                ephemeral: true,
            });

            const TargetHigherThanBot = new MessageEmbed()
                .setTitle(`${emojis.ERROR} I can't do that`)
                .setDescription(`${target.username}'s position is higher or equal to mine`)
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                });

            if (botPosition <= targetPosition) return interaction.reply({
                embeds: [TargetHigherThanBot],
                ephemeral: true,
            });

            await GuildMember.kick(kickReason);

            const UserKicked = new MessageEmbed()
                .setTitle(`A user has been kicked`)
                .setColor(colours.ERRORRED)
                .addFields({
                    name: "Moderator:",
                    value: `${interaction.user.tag} (${interaction.user.id})`,
                    inline: true,
                }, {
                    name: "Target Details:",
                    value: `${target.tag} (${target.id})`,
                    inline: true,
                }, {
                    name: "Kick Reason:",
                    value: `${kickReason}`,
                    inline: true,
                }, {
                    name: "Time of Kick:",
                    value: `<t:${Math.round(new Date().getTime() / 1000)}:F>`,
                    inline: true,
                }, {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true,
                }, {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true,
                })
                .setFooter({
                    text: `${interaction.guild.name} Moderation powered by GBF`,
                    iconURL: client.user.displayAvatarURL(),
                });

            return interaction.reply({
                embeds: [UserKicked]
            })

        } else return interaction.reply({
            content: `⚠ That user is not in ${interaction.guild.name} ⚠`
        })
    }
};
