# GBF Handler [Discord.JS V14, GBF V2.5.0]

## Setup
### Token & Database
To avoid hard-coding in your bot's token & mongoURI, they go into the config.json file, this can be found in the config folder by default but of-course you can change it's location, but if you choose to do so, you'll have to update the imports in the index.ts/js file 

### Handler Features
The new and updated GBF Handler now has options in the index file, when setting up your client, you can add the following options: 
1. Version : The version that you're bot is on, this helps you version track
2. CommandsFolder : The location of the commands folder, this is where your commands are
3. EventsFolder : The location of your events folder, this is where your events are
4. Prefix : The default bot prefix for legacy commands
5. LogActions : Choose whether the handler should inform you about the test only servers & non-registered commands
6. SupportServer : An invite link to your bot's support server
7. IgnoredHelpCategories : Ignored categories that won't be displayed in the help menu
8. config : Location of the config file that contains your token and monogURI
9. Developers : IDs of your bot's developers
10. Partners : IDs of your bot's partners
11. TestServers : IDs of the test only servers
12. DisabledCommands : An array that contains all command names that won't be registered
13. DisabledDefaultCommands : A boolean value that sets if commands can be ran in DMs


## Default Commands
GBF offers a bot-ban command that allows you to ban users from using your bot and offers a simulate command that can be used to simulate client events, both can be disabled and an enum is available to help that
