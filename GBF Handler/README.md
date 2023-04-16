# GBF Handler [Discord.JS V14, GBF V2.5.0]

## Info
This is the latest version of the handler that GBF uses, this is the base of what GBF uses, to find commands and events please go to GBF vN where N is the version of Discord.JS that you use.

## Setup
GBF Handler's setup involves a few steps with many optional features.

1. Setup your config.json file, you can choose to use a .env but you'll have to update the `index.js`, `clienthandler.js` (Found in handler), `interactionCreate.js` & `messageCreate.js`.
2. Specify the intents you need in your `index.js` file, Guilds is requried while GuidMessages & MessageContent are required if you want to use the legacy command features
3. To specify your test guilds go to `GBFconfig.json` in the config folder and specify your test guilds as `TestGuilds: [""]`
4. Specify your developer & partner ID(s), default prefix in the `GBFconfig.json`

## Default Commands
1. Blacklist / Bot Ban
=> This is a developer only command that bans a user from using your bot, this can be effecitive for stopping bad actors from abusing your bot

## Default Events
1. Client#Ready
=> This is emitted when your bot turns on, a UI has been designed for you but you can always change it to your liking. `Found in the events folder under ready.js`

## The GBF Folder
This is a folder that contains the emotes the bot uses, color codes and more quality of life files that make UI work a lot easier.
