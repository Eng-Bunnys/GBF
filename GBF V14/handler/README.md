# GBF V14 Handler

## How to setup:
1. Initiate the handler in your index.js file as shown in the index.js file found here
2. Create your commands and events folder to store your commands and events
3. Done

## Test Servers:
1. Go to clientHandler.js
2. In the `if (guildCommands.length)` block fetch your guilds using `const TestGuild = await this.guilds.fetch("GUILD_ID");` then do `await TestGuild.commands.set(guildCommands);`

Future Plan:
GBF is planning on having a test guild array in the index to remove this step.

### Warning 
GBF V14 does not support legacy commands due to Discord's current changes, if you'd like to use legacy commands the message handler can be found in the V13 version
