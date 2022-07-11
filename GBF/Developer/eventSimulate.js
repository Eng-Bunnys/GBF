const SlashCommand = require('../../utils/slashCommands');

const colours = require('../../GBFColor.json');
const emojis = require('../../GBFEmojis.json');
const titles = require('../../gbfembedmessages.json');

module.exports = class SimEvents extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "simulate",
            description: "[Developer] Simulate events",
            category: "Developer",
            userPermission: [],
            botPermission: ['SEND_MESSAGES', 'EMBED_LINKS'],
            cooldown: 0,
            development: true,
            devOnly: false,

            subcommands: {
                join: {
                    description: "Simulate guildMemberAdd event",
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        client.emit('guildMemberAdd', interaction.member);
                        return interaction.reply({
                            content: `${emojis.VERIFY} Simulated User Join`
                        })
                    }
                },
                leave: {
                    description: "Simulate guildMemberRemove event",
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        client.emit('guildMemberRemove', interaction.member);
                        return interaction.reply({
                            content: `${emojis.VERIFY} Simulated User Leave`
                        })
                    }
                },
                channelcreate: {
                    description: "Simulate channelCreate event",
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        client.emit('channelCreate', interaction.channel);
                        return interaction.reply({
                            content: `${emojis.VERIFY} Simulated Channel Create`
                        })
                    }
                },
                channeldelete: {
                    description: "Simulate channelDelete event",
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        client.emit('channelDelete', interaction.channel);
                        return interaction.reply({
                            content: `${emojis.VERIFY} Simulated Channel Delete`
                        })
                    }
                },
                channelupdate: {
                    description: "Simulate channelUpdate event",
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        client.emit('channelUpdate', interaction.channel);
                        return interaction.reply({
                            content: `${emojis.VERIFY} Simulated Channel Update`
                        })
                    }
                },
                freebie: {
                    description: "Simulate freebieSend event",
                    args: [{
                        name: "launcher",
                        type: "STRING",
                        description: "The launcher of the freebie",
                        choices: [{
                            name: "Epic Games",
                            value: "EPIC"
                        }, {
                            name: "Steam",
                            value: "STEAM"
                        }, {
                            name: "GOG",
                            value: "GOG"
                        }, {
                            name: "Origin",
                            value: "ORIGIN"
                        }, {
                            name: "Ubisoft",
                            value: "UBISOFT"
                        }, {
                            name: "Prime Gaming",
                            value: "PRIME"
                        }],
                        required: true
                    }, {
                        name: "number",
                        type: "INTEGER",
                        description: "The number of games in the freebie",
                        maxValue: 3,
                        minValue: 1,
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        client.emit('freebieSend', interaction.options.getString("launcher"), interaction.options.getInteger("number"), interaction.user);
                        return interaction.reply({
                            content: `${emojis.VERIFY} Simulated Freebie Send [${interaction.options.getString("launcher")} - ${interaction.options.getInteger("number")}]`
                        })
                    }
                },
                guilddelete: {
                    description: "Simulate guildDelete event",
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        client.emit('guildDelete', interaction.guild);
                        return interaction.reply({
                            content: `${emojis.VERIFY} Simulated Guild Delete`
                        })
                    }
                }
            }
        })
    }
}
