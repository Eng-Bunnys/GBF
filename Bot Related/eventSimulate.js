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
//Channel Delete
client.emit('channelDelete', interaction.channel);
         return interaction.reply({
          content: `${emojis.VERIFY} Simulated Channel Delete`
 })
//Bot Join
client.emit('guildCreate', interaction.guild);
         return interaction.reply({
          content: `${emojis.VERIFY} Simulated Guild Create`
 })
