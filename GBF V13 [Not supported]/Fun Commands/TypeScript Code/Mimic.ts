import { BaseGuildTextChannel } from 'discord.js';

export default {
    name: "mimic",
    category: 'Fun',
    description: 'Mimic a user',

    options: [{
        name: "user",
        description: "The user that you want to mimic",
        type: "USER",
        required: true,
    }, {
        name: "message",
        description: "The message that you want to send as that user",
        type: "STRING",
        required: true,
    }],

    slash: true,
    testOnly: true,
    cooldown: "5s",

    callback: async ({ interaction }) => {

        const targetUser = interaction.options.getUser("user")!;
        const mimicMessage = interaction.options.getString("message")!;

        if (targetUser.id === interaction.user.id) return interaction.reply({
            content: `You can't mimic yourself, just send a message to yourself 🙄`,
            ephemeral: true
        })

        let displayAvatar;
        let displayName;

        const fetchedUser = interaction.guild?.members.cache.get(targetUser.id);

        if (!fetchedUser) { displayName = targetUser.username; displayAvatar = targetUser.displayAvatarURL(); }
        else displayName = fetchedUser!.nickname || targetUser.username; displayAvatar = fetchedUser!.displayAvatarURL();

        const currentChannel = await interaction?.channel! as BaseGuildTextChannel;

        const liveWebhooks = await currentChannel.fetchWebhooks();

        if (liveWebhooks.size >= 10) {
            const oldestWebhook = liveWebhooks.first()!;
            await oldestWebhook.delete();
        }

        const mimicWebhook = await currentChannel.createWebhook(`${displayName}`, {
            avatar: displayAvatar,
            reason: `${interaction.user.username} is mimicking ${targetUser.username}`,
        })

        await interaction.reply({
            content: `Sending message as ${targetUser.username}, feel free to dismiss this message.`,
            ephemeral: true
        })

        await mimicWebhook.send({
            content: `${mimicMessage}`
        })

        setTimeout(() => mimicWebhook.delete(), 3000);

    }
