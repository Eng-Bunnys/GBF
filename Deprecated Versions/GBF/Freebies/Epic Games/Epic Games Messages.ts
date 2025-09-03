import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  hyperlink
} from "discord.js";
import emojis from "../../GBFEmojis.json";

import EGS from "../Game Settings/Epic Games Settings.json";

let UpcomingGamesDisplay: string | null = `Upcoming Games: `;
if (EGS.UpcomingGames) {
  if (EGS.UpcomingGameOne) UpcomingGamesDisplay += `${EGS.UpcomingGameOne}`;
  if (EGS.UpcomingGameTwo) UpcomingGamesDisplay += `, ${EGS.UpcomingGameTwo}`;
  if (EGS.UpcomingGameThree)
    UpcomingGamesDisplay += `, ${EGS.UpcomingGameThree}`;
} else UpcomingGamesDisplay = null;

export const OneGameEpicGamesButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(EGS.GameLink)
      .setLabel(EGS.GameTitle)
      .setEmoji(emojis.EPIC),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(EGS.InstantCheckout)
      .setLabel("Instant Checkout")
      .setEmoji(emojis.EPIC)
  ]);

export const OneGameEpicGamesEmbed = new EmbedBuilder()
  .setTitle(`${emojis.TRACER} Epic Games Freebie ${emojis.BREAKDANCE}`)
  .setURL(EGS.GameLink)
  .setThumbnail(EGS.GamePicture)
  .setDescription(`• Number of Freebies: 1`)
  .addFields(
    {
      name: `${emojis.EPIC} [${EGS.GameTitle}]`,
      value: `${EGS.GameLink}\n• ${hyperlink(
        "Instant Checkout Button",
        EGS.InstantCheckout
      )}`
    },
    {
      name: `${EGS.GameTitle} Rating:`,
      value: `• ${EGS.GameRating} / 5 ⭐`
    }
  )
  .setFooter({
    text: `${
      UpcomingGamesDisplay !== null
        ? UpcomingGamesDisplay + ` | GBF Freebies`
        : "GBF Freebies"
    }`
  });

if (EGS.HasTimeStamp)
  OneGameEpicGamesEmbed.addFields({
    name: `${EGS.GameTitle} is free to claim until:`,
    value: `<t:${EGS.Timestamp}:f>, <t:${EGS.Timestamp}:R>`
  });

OneGameEpicGamesEmbed.addFields({
  name: "Original Game Prices [From Steam]:",
  value: `\`\`\`• ${EGS.GameTitle} : $${EGS.GamePrice} USD\n• Total: $${EGS.GamePrice} USD\`\`\``
});

export const TwoGamesEpicGamesButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(EGS.GameLink)
      .setLabel(EGS.GameTitle)
      .setEmoji(emojis.EPIC),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(EGS.GameTwoLink)
      .setLabel(EGS.GameTwoTitle)
      .setEmoji(emojis.EPIC),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(EGS.InstantCheckout)
      .setLabel("Instant Checkout")
      .setEmoji(emojis.EPIC)
  ]);

export const TwoGamesEpicGamesEmbed = new EmbedBuilder()
  .setTitle(`${emojis.TRACER} Epic Games Freebies ${emojis.BREAKDANCE}`)
  .setDescription(`• Number of Freebies: 2`)
  .addFields(
    {
      name: `${emojis.EPIC} [${EGS.GameTitle}]`,
      value: `${EGS.GameLink}`,
      inline: true
    },
    {
      name: `${emojis.EPIC} [${EGS.GameTwoTitle}]`,
      value: `${EGS.GameTwoLink}`,
      inline: true
    },
    {
      name: "Instant Checkout:",
      value: `• ${hyperlink(
        `${EGS.GameTitle} & ${EGS.GameTwoTitle}`,
        EGS.InstantCheckout
      )}`,
      inline: true
    },
    {
      name: `Game Ratings:`,
      value: `• ${EGS.GameTitle}: ${EGS.GameRating}/5 ⭐\n• ${EGS.GameTwoTitle}: ${EGS.GameTwoRating}/5 ⭐`
    }
  )
  .setFooter({
    text: `${
      UpcomingGamesDisplay !== null
        ? UpcomingGamesDisplay + ` | GBF Freebies`
        : "GBF Freebies"
    }`
  });

if (EGS.HasTimeStamp)
  TwoGamesEpicGamesEmbed.addFields({
    name: `${EGS.GameTitle} and ${EGS.GameTwoTitle} are free to claim until:`,
    value: `<t:${EGS.Timestamp}:f>, <t:${EGS.Timestamp}:R>`
  });

TwoGamesEpicGamesEmbed.addFields({
  name: "Original Game Prices [From Steam]:",
  value: `\`\`\`• ${EGS.GameTitle} : $${EGS.GamePrice} USD\n• ${
    EGS.GameTwoTitle
  } : $${EGS.GameTwoPrice} USD\n• Total: $${Math.round(
    Number(EGS.GamePrice) + Number(EGS.GameTwoPrice)
  )} USD\`\`\``
});

export const ThreeGamesEpicGamesButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(EGS.GameLink)
      .setLabel(EGS.GameTitle)
      .setEmoji(emojis.EPIC),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(EGS.GameTwoLink)
      .setLabel(EGS.GameTwoTitle)
      .setEmoji(emojis.EPIC),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(EGS.GameThreeLink)
      .setLabel(EGS.GameThreeTitle)
      .setEmoji(emojis.EPIC),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(EGS.InstantCheckout)
      .setLabel("Instant Checkout")
      .setEmoji(emojis.EPIC)
  ]);

export const ThreeGamesEpicGamesEmbed = new EmbedBuilder()
  .setTitle(`${emojis.TRACER} Epic Games Freebies ${emojis.BREAKDANCE}`)
  .setDescription(`• Number of Freebies: 3`)
  .addFields(
    {
      name: `${emojis.EPIC} [${EGS.GameTitle}]`,
      value: `${EGS.GameLink}`,
      inline: true
    },
    {
      name: `${emojis.EPIC} [${EGS.GameTwoTitle}]`,
      value: `${EGS.GameTwoLink}`,
      inline: true
    },
    {
      name: `${emojis.EPIC} [${EGS.GameThreeTitle}]`,
      value: `${EGS.GameThreeLink}`,
      inline: true
    },
    {
      name: "Instant Checkout:",
      value: `• ${hyperlink(
        `${EGS.GameTitle} & ${EGS.GameTwoTitle}`,
        EGS.InstantCheckout
      )}`,
      inline: false
    },
    {
      name: `Game Ratings:`,
      value: `• ${EGS.GameTitle}: ${EGS.GameRating}/5 ⭐\n• ${EGS.GameTwoTitle}: ${EGS.GameTwoRating}/5 ⭐\n• ${EGS.GameThreeTitle}: ${EGS.GameThreeRating}/5 ⭐`
    }
  )
  .setFooter({
    text: `${
      UpcomingGamesDisplay !== null
        ? UpcomingGamesDisplay + ` | GBF Freebies`
        : "GBF Freebies"
    }`
  });

if (EGS.HasTimeStamp)
  ThreeGamesEpicGamesEmbed.addFields({
    name: `${EGS.GameTitle}, ${EGS.GameTwoTitle} and ${EGS.GameThreeTitle} are free to claim until:`,
    value: `<t:${EGS.Timestamp}:f>, <t:${EGS.Timestamp}:R>`
  });

ThreeGamesEpicGamesEmbed.addFields({
  name: "Original Game Prices [From Steam]:",
  value: `\`\`\`• ${EGS.GameTitle} : $${EGS.GamePrice} USD\n• ${
    EGS.GameTwoTitle
  } : $${EGS.GameTwoPrice} USD\n• ${EGS.GameThreeTitle} : $${
    EGS.GameThreePrice
  } USD\n• Total: $${Math.round(
    Number(EGS.GamePrice) +
      Number(EGS.GameTwoPrice) +
      Number(EGS.GameThreePrice)
  )} USD\`\`\``
});
