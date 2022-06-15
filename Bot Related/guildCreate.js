const {
    MessageEmbed,
    Permissions
} = require("discord.js")l

const colours = require('../GBFColor.json')

const {
    redBright,
} = require('chalk');

const PREFIX = '/'

const guildChannels = (guild) => {
    let channel;
    if (guild.channels.cache.has(guild.id)) {
        channel = guild.channels.cache.get(guild.id)
        if (channel.permissionsFor(guild.client.user).has(Permissions.FLAGS.SEND_MESSAGES)) {
            return guild.channels.cache.get(guild.id)
        }
    }
    //Looking for a channel with the name "general"
    channel = guild.channels.cache.find(channel =>  channel.name.includes("general") && channel.permissionsFor(guild.client.user).has(Permissions.FLAGS.SEND_MESSAGES) && channel.type === "GUILD_TEXT");
    if (channel) return channel;
    //If there is no general chat look for a channel that the bot can send messages in
    return guild.channels.cache.filter(c => c.type === "GUILD_TEXT" && c.permissionsFor(guild.client.user).has(Permissions.FLAGS.SEND_MESSAGES)).sort((a, b) => a.position - b.position).first();
}

module.exports = (client) => {
    //Guild Create event : this triggers when a bot joins a server : https://discord.js.org/#/docs/discord.js/stable/class/Client
    client.on("guildCreate", async (guild) => {
        //Getting a channel in the server
        const channel = guildChannels(guild)
        if (!channel) return;
        //Creating the welcome embed
        const welcomemessage = new MessageEmbed()
            .setTitle(`${client.user.username} is here!`)
            .setDescription(`Thanks for choosing **${client.user.username}**!\n\n<a:arrow:819986651208089640> My default prefix is \`\`${PREFIX}\`\`\n<a:arrow:819986651208089640> You can run \`\`!!help\`\` to have an idea about what the bot can do!\n\n If you want to report a bug or suggest a feature you can join the support server and tell us!: [Support server](${'https://discord.gg/PuZMhvhRyX'})`)
            .setColor(colours.DEFAULT)
            .setFooter(client.user.tag, client.user.displayAvatarURL())
        //Sending it to the channel
        channel.send({
            embeds: [welcomemessage]
        }).catch(() => {});

         //Fetching a channel to tell the devs that I've been added to a server
        const tellDevsChannel = await client.channels.fetch("ID").catch(() => null)

        const newServer = new MessageEmbed()
            .setTitle(`I have been added to ${guild.name}`)
            .setColor(colours.DEFAULT)
            .setDescription(`${guild.name} has ${guild.memberCount} members`)

        tellDevsChannel.send({
            embeds: [newServer]
        })
        tellDevsChannel.send({
            content: `<@YOUR ID> I have been added to ${guild.name}`
        })
        //Adding it to the console 
        console.log(redBright(`I have been added to ${guild.name} and has ${guild.memberCount} members`))
    })
}
