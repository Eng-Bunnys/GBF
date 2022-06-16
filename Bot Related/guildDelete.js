const {
    MessageEmbed,
    Permissions
} = require("discord.js");

const colours = require('../GBFColor.json');
const emojis = require('../GBFEmojis.json');

const {
    redBright,
} = require('chalk');


module.exports = (client) => {
    //Guild delete event : Emitted when a server is deleted/bot is kicked from it : https://discord.js.org/#/docs/discord.js/stable/class/Client?scrollTo=e-guildDelete
    client.on("guildDelete", async (guild) => {

        const kickedOrDelete = new MessageEmbed()
            .setTitle(`${emojis.ERROR} I've been kicked`)
            .setDescription(`I've been kicked from ${guild.name} (${guild.id})\nMembers: ${guild.memberCount}`)
            .setColor(colours.ERRORRED)
            .setTimestamp()
        //Sending a message to a developer channel to inform the developers
        const devChannel = await client.channels.fetch("ID").catch(() => null)

        devChannel.send({
            embeds: [kickedOrDelete]
        })
        //Telling the developer
        devChannel.send({
            content: `<@ID> I have been removed from ${guild.name}`
        })
        //Adding the info in a console
        console.log(redBright(`I have been removed from ${guild.name}, it has ${guild.memberCount} members`))
    })
}
