//The first unlock all uses a system that changes the permission for every channel in a server, that ofcourse is inefficient if the server is large, can cause rate limits etc
//So to get past this we allow the "Send Messages" permission for the @everyone role
//Looking for the everyone role
const everyoneRole = interaction.guild.roles.cache.find(role => role.id === interaction.guild.id);
//You can also do: interaction.guild.roles.everyone instead of the code above
//Now we add the SEND_MESSAGES permission from the role
await everyoneRole.setPermissions(everyoneRole.permissions.add(Permissions.FLAGS.SEND_MESSAGES));

//Enhanced:
       //Getting the optional role
      const roleId = interaction.options.getRole("role");
        //If the role is available
        let displayRole
        let targetRoleId
        if (roleId) {
            displayRole = `<@&${roleId.id}>`;
            targetRoleId = roleId.id;
        } else {
            displayRole = "@everyone";
            targetRoleId = interaction.guild.id
        }
        //Fetching it
        const targetRole = interaction.guild.roles.cache.find(role => role.id === targetRoleId);
        //If it doesn't exist
        if (!targetRole) return interaction.reply({
            content: `${emojis.ERROR} I couldn't find the specified role.`,
            ephemeral: true
        })
        //Giving the role permissions
        await targetRole.setPermissions(targetRole.permissions.add(Permissions.FLAGS.SEND_MESSAGES));

        const reverseLockedDown = new MessageEmbed()
            .setTitle(`${emojis.SUCCESS} Success`)
            .setDescription(`Unlocked all channels for ${displayRole} in ${guild.name}`)
            .setColor(colours.DEFAULT)
            .setTimestamp()
            .setFooter({
                text: `${guild.name} powered by GBF`,
                iconURL: guild.iconURL()
            })

        await interaction.reply({
            embeds: [reverseLockedDown]
        });
