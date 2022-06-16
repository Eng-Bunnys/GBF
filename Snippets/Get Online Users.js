       //Mapping all of the guild's users, checking if the presence is not equal to null, if it isn't return the presence, if it is return offline
      const guildStatus = interaction.guild.members.cache.map(member => {
            if (member.presence !== null) return member.presence.status
            else return 'offline'
        })
        console.log(guildStatus)

/*
Output
[
  'idle',    'online',
  'offline', 'offline',
  'online',  'offline',
  'online'
]
*/
