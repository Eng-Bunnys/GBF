import { Constants, MessageEmbed, TextChannel } from 'discord.js';

    options: [{
        name: "count",
        description: "number of messages to delete",
        type: Constants.ApplicationCommandOptionTypes.INTEGER,
        minValue: 1,
        maxValue: 100,
        required: true
    }],

        const numberOfMessages = interaction.options.getInteger("count")!;

        const currentChannel = interaction.channel! as TextChannel;

        const fetchedMessages = await currentChannel.messages.fetch({
            limit: numberOfMessages
        });

        const confirmMessage = new MessageEmbed()
            .setTitle(`<:TS:1003807193528807566> GBF TypeScript Beta <:TS:1003807193528807566>`)
            .setDescription(`Deleting ${numberOfMessages} messages...`)
            .setFooter({
                text: `This message will be deleted in ~5 seconds`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp()
            .setColor("#e91e63")

        await interaction.reply({
            embeds: [confirmMessage]
        })

        await currentChannel.bulkDelete(fetchedMessages, true);

        setTimeout(() => { return interaction.deleteReply() }, 5000);
