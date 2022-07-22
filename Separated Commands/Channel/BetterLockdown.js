//The first lockdown uses a system that changes the permission for every channel in a server, that ofcourse is inefficient if the server is large, can cause rate limits etc
//So to get past this we deny the "Send Messages" permission for the @everyone role
//Looking for the everyone role
const everyoneRole = interaction.guild.roles.cache.find(role => role.id === interaction.guild.id);
//You can also do: interaction.guild.roles.everyone instead of the code above
//Now we remove the SEND_MESSAGES permission from the role
await everyoneRole.setPermissions(everyoneRole.permissions.remove(Permissions.FLAGS.SEND_MESSAGES));


//Enhanced for a role
       //Getting the optional role
      const roleId = interaction.options.getRole("role");
        
        let displayRole
        let targetRoleId 
        //If the role exists or does not exist
        if (roleId) {
            displayRole = `<@&${roleId.id}>`;
            targetRoleId = roleId.id;
        } else {
            displayRole = "@everyone";
            targetRoleId = interaction.guild.id
        }
        //Looking for the role
        const targetRole = interaction.guild.roles.cache.find(role => role.id === targetRoleId);
         //If the role doesn't exist
        if (!targetRole) return interaction.reply({
            content: `I couldn't find that role`,   
            ephemeral: true
        });
        //Removing it's perms
        await targetRole.setPermissions(targetRole.permissions.remove(Permissions.FLAGS.SEND_MESSAGES));

        const lockedDown = new MessageEmbed()
            .setTitle(`${emojis.SUCCESS} Success`)
            .setDescription(`Locked down all channels for ${displayRole} in ${guild.name}`)
            .setColor(colours.DEFAULT)
            .setTimestamp()
            .setFooter({
                text: `${guild.name} powered by GBF`,
                iconURL: guild.iconURL()
            })

        await interaction.reply({
            embeds: [lockedDown]
        });
