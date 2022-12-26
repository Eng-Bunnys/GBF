const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js');

const EGS = require('./EGS-Settings.json');

const emojis = require('../GBFEmojis.json');
const titles = require('../gbfembedmessages.json');
const colours = require('../GBFColor.json');

const botInvite = `https://discord.com/api/oauth2/authorize?client_id=795361755223556116&permissions=1642788809975&scope=bot%20applications.commands`;
const topGG = `https://top.gg/bot/795361755223556116/vote`;
const serverInvite = `https://discord.gg/yrM7fhgNBW`;

let OnePrice = Number(EGS.STEAMPRICE);
let TwoPrice = Number(EGS.STEAMPRICE2);
let ThreePrice = Number(EGS.STEAMPRICE3);
let TotalTwo = OnePrice + TwoPrice;
let TotalThree = TotalTwo + ThreePrice;

const EpicGamesOneGameEmbed = new MessageEmbed()
    .setTitle(`${emojis.BREAKDANCE} Today's free games! ${emojis.TRACER}`)
    .setURL(EGS.EGLinkOne)
    .setDescription(`• Number of free games today: 1`)
    .addFields({
        name: `${emojis.EPIC} [${EGS.EGTitleOne}]`,
        value: `<${EGS.EGLinkOne}>`
    }, {
        name: `${EGS.EGTitleOne} is free to claim until:`,
        value: `<t:${EGS.FreeUntilCode}:f>, <t:${EGS.FreeUntilCode}:R>`
    }, {
        name: `Total money saved by claiming ${EGS.EGTitleOne} (calculated from Steam's prices)`,
        value: `\`\`\`• ${EGS.EGTitleOne} : $${EGS.STEAMPRICE} USD\n• Total: $${EGS.STEAMPRICE} USD\`\`\``
    })

const EpicGamesTwoGamesEmbed = new MessageEmbed()
    .setTitle(`${emojis.BREAKDANCE} Today's free games! ${emojis.TRACER}`)
    .setURL(topGG)
    .setDescription(`• Number of free games today: 2`)
    .addFields({
        name: `${emojis.EPIC} [${EGS.EGTitleOne}]`,
        value: `<${EGS.EGLinkOne}>`,
        inline: true
    }, {
        name: `${emojis.EPIC} [${EGS.EGTitleTwo}]`,
        value: `<${EGS.EGLinkTwo}>`,
        inline: true
    }, {
        name: `${EGS.EGTitleOne} and ${EGS.EGTitleTwo} are free to claim until:`,
        value: `<t:${EGS.FreeUntilCode}:f>, <t:${EGS.FreeUntilCode}:R>`
    }, {
        name: `Total money saved by claiming ${EGS.EGTitleOne} and ${EGS.EGTitleTwo} (calculated from steam's prices)`,
        value: `\`\`\`• ${EGS.EGTitleOne} : $${EGS.STEAMPRICE} USD\n• ${EGS.EGTitleTwo} : $${EGS.STEAMPRICE2} USD\n• Total: $${TotalTwo} USD\`\`\``
    })


const EpicGamesThreeGamesEmbed = new MessageEmbed()
    .setTitle(`${emojis.BREAKDANCE} Today's free games! ${emojis.TRACER}`)
    .setURL(topGG)
    .setDescription(`• Number of free games today: 3`)
    .addFields({
        name: `${emojis.EPIC} [${EGS.EGTitleOne}]`,
        value: `<${EGS.EGLinkOne}>`,
        inline: true
    }, {
        name: `${emojis.EPIC} [${EGS.EGTitleTwo}]`,
        value: `<${EGS.EGLinkTwo}>`,
        inline: true
    }, {
        name: `${emojis.EPIC} [${EGS.EGTitleThree}]`,
        value: `<${EGS.EGLinkThree}>`,
        inline: true
    }, {
        name: `${EGS.EGTitleOne}, ${EGS.EGTitleTwo} and ${EGS.EGTitleThree} are free to claim until:`,
        value: `<t:${EGS.FreeUntilCode}:f>, <t:${EGS.FreeUntilCode}:R>`
    }, {
        name: `Total money saved by claiming ${EGS.EGTitleOne}, ${EGS.EGTitleTwo} and ${EGS.EGTitleThree} (calculated from steam's prices)`,
        value: `\`\`\`• ${EGS.EGTitleOne} : $${EGS.STEAMPRICE} USD\n• ${EGS.EGTitleTwo} : $${EGS.STEAMPRICE2} USD\n• ${EGS.EGTitleThree} : $${EGS.STEAMPRICE3} USD\n• Total: $${TotalThree} USD\`\`\``
    })


const epicGamesOneB = new MessageButton()
    .setStyle(`LINK`)
    .setEmoji(emojis.EPIC)
    .setLabel(EGS.EGTitleOne)
    .setURL(EGS.EGLinkOne)

const epicGamesTwoB = new MessageButton()
    .setStyle(`LINK`)
    .setEmoji(emojis.EPIC)
    .setLabel(EGS.EGTitleTwo)
    .setURL(EGS.EGLinkTwo)

const epicGamesThreeB = new MessageButton()
    .setStyle(`LINK`)
    .setEmoji(emojis.EPIC)
    .setLabel(EGS.EGTitleThree)
    .setURL(EGS.EGLinkThree)

const EpicGamesOneGameButtons = new MessageActionRow().addComponents([epicGamesOneB]);
const EpicGamesTwoGamesButtons = new MessageActionRow().addComponents([epicGamesOneB, epicGamesTwoB]);
const EpicGamesThreeGamesButtons = new MessageActionRow().addComponents([epicGamesOneB, epicGamesTwoB, epicGamesThreeB]);

module.exports = {
    EpicGamesOneGameEmbed,
    EpicGamesTwoGamesEmbed,
    EpicGamesThreeGamesEmbed,
    EpicGamesOneGameButtons,
    EpicGamesTwoGamesButtons,
    EpicGamesThreeGamesButtons
}
