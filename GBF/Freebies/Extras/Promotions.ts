import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  hyperlink
} from "discord.js";

export const topGG = `https://top.gg/bot/795361755223556116/vote`;
export const PaypalLink = `https://paypal.me/youssefothamn?country.x=EG&locale.x=en_US`;
export const GBFSrc = `https://github.com/GBF-Nexus/Discord-Bot-Commands-and-Handler`;
export const GBFServer = `https://discord.gg/yrM7fhgNBW`;

export const TipMessage = new EmbedBuilder()
  .setTitle(`Enjoying our services?`)
  .setURL(topGG)
  .setDescription(
    `Only want freebies from a certain launcher? Customize GBF using </freebie categories:1007317538281107506> or change the default settings using </freebie update:1007317538281107506>!\nStill need help? Ask us in the ${hyperlink(
      "support server",
      GBFServer
    )}\n\nSupport GBF by ${hyperlink("voting on top.gg", topGG)} or ${hyperlink(
      "donating!",
      PaypalLink
    )}\n${hyperlink("GBF Source Code", GBFSrc)}`
  );

export const TipButtons: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(topGG)
      .setLabel("Vote for me on Top.GG"),
    new ButtonBuilder()
      .setLabel("Donate via PayPal")
      .setURL(PaypalLink)
      .setStyle(ButtonStyle.Link)
  ]);
