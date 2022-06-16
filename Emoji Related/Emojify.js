//This command turns normal text into emojis
                        //Getting the args/data
                        const args = interaction.options.getString('text');
                        const secret = interaction.options.getString('secret') || 'false';

                        const numbers = {
                            ' ': '   ',
                            '0': ':zero:',
                            '1': ':one:',
                            '2': ':two:',
                            '3': ':three:',
                            '4': ':four:',
                            '5': ':five:',
                            '6': ':six:',
                            '7': ':seven:',
                            '8': ':eight:',
                            '9': ':nine:',
                            '!': ':grey_exclamation:',
                            '?': ':grey_question:',
                            '#': ':hash:',
                            '*': ':asterisk:'
                        };
                        //The emojis start with :regional_indicator_<>: so we do this to change letters to emojis
                        'abcdefghijklmnopqrstuvwxyz'.split('').forEach(c => {
                            numbers[c] = numbers[c.toUpperCase()] = ` :regional_indicator_${c}:`;
                        });
                        //Some validation to check if the args is big enough
                        if (args.length =< 1) {
                            return interaction.reply({
                                content: "You must provide some text to emojify!",
                                ephemeral: true
                            });
                        }

                        if (secret === 'false') return interaction.reply({
                            content: args.split('').map(c => numbers[c] || c).join('')
                        });
                        else {
                            await interaction.reply({
                                content: `Sending... || Feel free to dismiss this message`,
                                ephemeral: true
                            })
                            return interaction.channel.send({
                                content: args.split('').map(c => numbers[c] || c).join('')
                            });
                        }
