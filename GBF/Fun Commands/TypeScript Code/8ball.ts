import { MessageEmbed } from 'discord.js';

export default {
    name: "8ball",
    category: 'Fun',
    description: '8ball command',

    slash: true,
    testOnly: true,
    cooldown: "3s",

    options: [{
        name: "question",
        description: "Question to ask the 8ball",
        type: "STRING",
        required: true,
    }],

    callback: async ({ interaction }) => {

        const questionAsked = interaction.options.getString("question");

        const answers = ['Yes', 'No', 'Maybe', 'Ask Later', 'No time to tell now', 'As I see it, yes.', 'Cannot predict now.', 'Concentrate and ask again.', 'It is certain.', 'I don\'t know '];

        const response = answers[Math.floor(Math.random() * answers.length)];

        const answerEmbed = new MessageEmbed()
            .setTitle("🎱 Magic 8Ball")
            .setDescription(`**Question »** ${questionAsked} \n **Answer »** ${response}`)
            .setColor(`#e91e63`)
            .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            })
        return interaction.reply({
            embeds: [answerEmbed]
        })

    }
