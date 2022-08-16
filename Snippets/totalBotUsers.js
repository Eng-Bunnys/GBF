// The cache counts every user uniquely hence not counting the total number of users in all guilds, hence we use <Guild>#memberCount method

const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
