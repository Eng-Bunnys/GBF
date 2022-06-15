//The first lockdown uses a system that changes the permission for every channel in a server, that ofcourse is inefficient if the server is large, can cause rate limits etc
//So to get past this we deny the "Send Messages" permission for the @everyone role
//Looking for the everyone role
const everyoneRole = interaction.guild.roles.cache.find(role => role.id === interaction.guild.id);
//You can also do: interaction.guild.roles.everyone instead of the code above
//Now we remove the SEND_MESSAGES permission from the role
await everyoneRole.setPermissions(everyoneRole.permissions.remove(Permissions.FLAGS.SEND_MESSAGES));
