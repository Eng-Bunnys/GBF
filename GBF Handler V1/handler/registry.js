const {
    lstatSync,
    readdirSync
} = require("fs")
const {
    join
} = require('path');
const Command = require('../utils/command');

async function registerCommands(client, ...dirs) {
    for (const dir of dirs) {
        let files = await readdirSync(join(__dirname, dir));

        for (let file of files) {
            let stat = await lstatSync(join(__dirname, dir, file));

            if (file.includes("-ignore")) continue;

            if (stat.isDirectory())
                await registerCommands(client, join(dir, file));
            else {
                if (file.endsWith(".js") || file.endsWith(".ts")) {
                    try {
                        let cmdModule = new(require(join(__dirname, dir, file)))(client);

                        if (cmdModule instanceof Command) {
                            const {
                                name,
                                aliases
                            } = cmdModule;

                            if (!name) {
                                console.log(`The '${join(__dirname, dir, file)}' command doesn't have a name, Please double check the code!`);
                                continue;
                            }

                            if (client.commands.has(name)) {
                                console.log(`The '${name}' (${join(__dirname, dir, file)}) command name has already been added, Please double check the code!`);
                                continue;
                            }

                            client.commands.set(name, cmdModule);
                            if (aliases)
                                aliases.map((alias) =>
                                    client.aliases.set(alias, name)
                                )

                        } else {
                            const {
                                name
                            } = cmdModule;

                            if (!name) {
                                console.log(`The '${join(__dirname, dir, file)}' command doesn't have a name, Please double check the code!`);
                                continue;
                            }

                            if (client.slashCommands.has(name)) {
                                console.log(`The '${name}' (${join(__dirname, dir, file)}) slash command name has already been added, Please double check the code!`);
                                continue;
                            }

                            if (cmdModule.development) {
                                const GBFTestMain = await client.guilds.fetch("827589582932410388");
                                const GBFTestMN = await client.guilds.fetch("439890528583286784");
                                const TSUwU = await client.guilds.fetch("614515078997475333");
                                const GBFTest4 = await client.guilds.fetch("850005402863140895")

                                if (!GBFTestMain || !GBFTestMN || !TSUwU || !GBFTest4) {
                                    console.log(`This command only works in ${GBFTestMain}, ${GBFTestMN}, ${TSUwU} and ${GBFTest4}.`);
                                    continue;
                                }
                            }
                            client.slashCommands.set(name, cmdModule);
                        }
                    } catch (e) {
                        console.log(`Error for loading the commands: ${e.message}`);
                    }
                }
            }
        }
    }
}


module.exports = {
    registerCommands
}