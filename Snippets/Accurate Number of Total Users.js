//The cache can be a bit weird and not give an accurate number of total bot users, so a way around this is to get every single guild the client is in and adding
//The number of members to an array then adding the contents of the array
let totalNumberOfUsers = [];
await client.guilds.cache.map(guild => {
   totalNumberOfUsers.push(guild.memberCount);
 return totalNumberOfUsers
 });
totalNumberOfUsers = totalNumberOfUsers.reduce((a, b) => a + b, 0);
