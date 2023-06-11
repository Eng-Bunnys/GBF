import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  hyperlink
} from "discord.js";

const topGG = ``;
const PaypalLink = ``;
const GBFSrc = ``;

export const TipMessage = new EmbedBuilder()
  .setTitle(`Enjoying our services?`)
  .setURL(topGG)
  .setDescription(
    `Support us for free by voting for GBF ${hyperlink(
      "on top.gg",
      topGG,
      "Thanks for the support"
    )} or ${hyperlink(
      "donate",
      PaypalLink,
      "We appreciate the support"
    )} to help fund GBF!\n\nWant to understand how GBF works? ${hyperlink(
      "GBF's code is now open source!",
      GBFSrc
    )}`
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
