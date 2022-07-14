import { MessageEmbed } from 'discord.js';

export default {
    name: "gayrate",
    category: 'Fun',
    description: "Gay rate machine",

    slash: true,
    testOnly: true,
    cooldown: "5s",

    options: [{
        name: "user",
        description: "The user that you want to use this machine on",
        type: "USER",
        required: true,
    }],

    callback: async ({ interaction }) => {

        const member = interaction.options.getUser("user") || interaction.user;

        const gayEmbed = new MessageEmbed()
        .setTitle("Gay rate machine 🏳️‍🌈")
        .setDescription(`${member.username} is **${Math.floor(Math.random() * 100)}%** gay 🏳️‍🌈`)
        .setColor("#e91e63")
       
        return interaction.reply({
            embeds: [gayEmbed]
        })

    }
