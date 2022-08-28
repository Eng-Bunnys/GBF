const titles = require('../../gbfembedmessages.json');
const emojis = require('../../GBFEmojis.json');
const colours = require('../../GBFColor.json');

const {
    MessageEmbed,
    MessageButton,
    MessageActionRow,
    Permissions
} = require('discord.js')

const RegisterSchema = require('../../schemas/Freebie Schemas/Server Profile Schema');
const PendingSchema = require('../../schemas/Freebie Schemas/Pending Registry Schema');

const {
    capitalize
} = require('../../utils/engine');

module.exports = (client) => {
    client.on("freebieRegister", async (guild, channel, automatic) => {

        let registerData = await RegisterSchema.findOne({
            guildId: guild.id
        });

        let pendingData = await PendingSchema.findOne({
            guildId: guild.id
        });

        if (!registerData || !pendingData) return;

        const registerChannel = await client.channels.fetch(`932756227295948910`).catch(() => null);

        let freebieChannel = await client.channels.fetch(registerData.Channel).catch(() => 'Deleted Channel');

        let pingDisplay
        if (registerData.Ping === false) pingDisplay = 'Disabled';
        else pingDisplay = 'Enabled';

        let pingedRole
        if (registerData.rolePing === null) pingedRole = 'Ping Disabled';
        else pingedRole = registerData.rolePing;

        const registerEmbed = new MessageEmbed()
            .setTitle(`${emojis.BREAKDANCE} New Freebie Registration ${emojis.TRACER}`)
            .setColor(colours.DEFAULT)
            .addFields({
                name: "• Registeration ID:",
                value: `${pendingData.ID}`,
                inline: true
            }, {
                name: `• Server Info:`,
                value: `- Name: ${guild.name}\n- ID: ${guild.id}\n- Total Human Count: ${guild.members.cache.filter((member) => !member.user.bot).size}`,
                inline: false
            }, {
                name: `• Freebie Settings:`,
                value: `- Channel: ${freebieChannel}\n- Ping: ${pingDisplay}\n- Role ID: ${pingedRole}\n- Embed Color: [${registerData.embedColor}](https://www.color-hex.com/color/${registerData.embedColor.slice(1)})`,
                inline: false
            }, {
                name: `• Automatic:`,
                value: `${capitalize(automatic.toString())}`,
            })
            .setFooter({
                text: `GBF Freebie Registration || ${guild.name}`,
                iconURL: client.user.displayAvatarURL()
            })

        return registerChannel.send({
            content: `<@333644367539470337>`,
            embeds: [registerEmbed]
        })

    })
}
