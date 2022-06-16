//Join:
client.emit('guildMemberAdd', interaction.member);
         return interaction.reply({
          content: `${emojis.VERIFY} Simulated User Join`
 })
//Leave
client.emit('guildMemberRemove', interaction.member);
         return interaction.reply({
          content: `${emojis.VERIFY} Simulated User Leave`
 })
//Channel Create
client.emit('channelCreate', interaction.channel);
         return interaction.reply({
          content: `${emojis.VERIFY} Simulated Channel Create`
 })
