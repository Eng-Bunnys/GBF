import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  BaseClient,
  ColorResolvable
} from "discord.js";

import colours from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import timerSchema from "../../schemas/User Schemas/Timer Schema";
import bankSchema from "../../schemas/User Schemas/User Profile Schema";

import { msToTime } from "../../utils/Engine";

import {
  xpRequired,
  xpRequiredAccount,
  checkUser,
  calculateXP,
  checkRank,
  checkRankAccount
} from "../../utils/TimerLogic";

module.exports = (client: BaseClient) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    // Checking if the interaction type is a button

    if (!interaction.isButton()) return;

    // Checking if the button clicked is part of the timer system

    if (
      interaction.customId !== "startTimer" &&
      interaction.customId !== "pauseTimer" &&
      interaction.customId !== "stopTimer" &&
      interaction.customId !== "unpauseTimer"
    )
      return;

    // Getting the user's data

    /**
       @messageID [message ID]
       @userID [interaction user ID]
       @initationTime [Date]
       @sessionLengths [Array]
       */

    const timerData =
      (await timerSchema.findOne({
        userID: interaction.user.id
      })) || undefined;

    const userData =
      (await bankSchema.findOne({
        userID: interaction.user.id
      })) || undefined;

    // If the user's data does not exist we return EMBED

    const noAccount = new EmbedBuilder()
      .setTitle(`${emojis.ERROR} 404 Not Found`)
      .setColor(colours.ERRORRED as ColorResolvable)
      .setDescription(
        `I couldn't find any data matching your user ID.\n\nCreate a new semester account using </timer registry:1068210539689414777>.`
      );

    if (!userData) {
      const newUserProfile = new bankSchema({
        userID: interaction.user.id
      });

      await newUserProfile.save();

      return interaction.reply({
        embeds: [noAccount],
        ephemeral: true
      });
    }

    if (!timerData)
      return interaction.reply({
        embeds: [noAccount],
        ephemeral: true
      });

    // Checking if the user initiated using message IDs EMBED

    const noMessageData = new EmbedBuilder()
      .setTitle(`${emojis.ERROR} 403 Forbidden`)
      .setColor(colours.ERRORRED as ColorResolvable)
      .setDescription(
        `You can't use that button, to create your own use </timer initiate:1068210539689414777>.`
      );

    // Fetching the original message
    const originalMessage = await interaction.channel.messages.fetch(
      timerData.messageID
    );

    const messageOwner =
      (await timerSchema.findOne({
        messageID: interaction.message.id
      })) || undefined;

    // If the original message does not exist EMBED

    const noMessage = new EmbedBuilder()
      .setTitle(`${emojis.ERROR} 404-1 Not Found`)
      .setColor(colours.ERRORRED as ColorResolvable)
      .setDescription(
        `The session initiation message tied to this account was not found, please use</timer initiate:1068210539689414777> to start a new session or create a new initiation message.`
      );

    // Checking if the user who used the button is the same user who used the command

    const invalidPermissions = new EmbedBuilder()
      .setTitle(`${emojis.ERROR} 403-1 Forbidden`)
      .setColor(colours.ERRORRED as ColorResolvable)
      .setDescription(
        `You can't use that, create your own using </timer registry:1068210539689414777>.`
      );

    if (interaction.customId === "startTimer") {
      const statusCheck = checkUser(
        timerData,
        originalMessage,
        messageOwner,
        interaction
      );

      if (statusCheck === "404")
        return interaction.reply({
          embeds: [noAccount],
          ephemeral: true
        });

      if (statusCheck === "403")
        return interaction.reply({
          embeds: [noMessageData],
          ephemeral: true
        });

      if (statusCheck === "404-1") {
        await timerData.updateOne({
          messageID: null
        });

        return interaction.reply({
          embeds: [noMessage],
          ephemeral: true
        });
      }

      if (statusCheck === "403-1") {
        return interaction.reply({
          embeds: [invalidPermissions],
          ephemeral: true
        });
      }

      // Creating the same buttons but with a disabled start to stop users from trying to start twice

      /**
       * @DS : [Disabled Start]
       */

      const mainButtonsRowDS = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setCustomId("startTimer")
          .setDisabled(true)
          .setEmoji("🕜")
          .setLabel("Start Timer")
          .setStyle(2),
        new ButtonBuilder()
          .setCustomId("pauseTimer")
          .setEmoji("⏰")
          .setLabel("Pause Timer")
          .setStyle(2),
        new ButtonBuilder()
          .setCustomId("stopTimer")
          .setEmoji("🕛")
          .setLabel("Stop Timer")
          .setStyle(2)
      ]);

      // Checking if the timer was already on

      const timerAlreadyOn = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} Error Starting Session`)
        .setColor(colours.ERRORRED as ColorResolvable)
        .setDescription(`The timer is already on.`);

      if (timerData.intiationTime) {
        // Attempting to fix the buttons

        await originalMessage.edit({
          components: [mainButtonsRowDS]
        });

        // Error messages will be set to ephemeral to avoid clutter

        return interaction.reply({
          embeds: [timerAlreadyOn],
          ephemeral: true
        });
      }

      // Starting the timer

      const timerStarted = new EmbedBuilder()
        .setTitle(`${emojis.VERIFY} Success`)
        .setColor(colours.DEFAULT as ColorResolvable)
        .setDescription(
          `Timer started ${interaction.user.username}, best of luck.`
        );

      // Adding the start time to the DB

      await timerData.startTime.push(new Date().getHours());

      // Adding the current date to the DB, we subtract the end time from the start time to get the time elapsed
      // Reseting the break data incase it never reset

      await timerData.updateOne({
        intiationTime: new Date(Date.now()),
        numberOfStarts: timerData.numberOfStarts + 1,
        lastSessionDate: new Date(Date.now()),
        breakTimerStart: null,
        sessionBreakTime: 0
      });

      await timerData.save();

      // Updating the original message to disable the start button

      await originalMessage.edit({
        components: [mainButtonsRowDS]
      });

      return interaction.reply({
        embeds: [timerStarted]
      });
    } else if (interaction.customId === "stopTimer") {
      const statusCheck = checkUser(
        timerData,
        originalMessage,
        messageOwner,
        interaction
      );

      if (statusCheck === "404")
        return interaction.reply({
          embeds: [noAccount],
          ephemeral: true
        });

      if (statusCheck === "403")
        return interaction.reply({
          embeds: [noMessageData],
          ephemeral: true
        });

      if (statusCheck === "404-1") {
        await timerData.updateOne({
          messageID: null
        });

        return interaction.reply({
          embeds: [noMessage],
          ephemeral: true
        });
      }

      if (statusCheck === "403-1") {
        return interaction.reply({
          embeds: [invalidPermissions],
          ephemeral: true
        });
      }

      // Creating the same buttons but with disabled buttons since the session ended

      /**
       * @DA : [Disabled All]
       */

      const mainButtonsRowDA = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setCustomId("startTimer")
          .setDisabled(true)
          .setEmoji("🕜")
          .setLabel("Start Timer")
          .setStyle(2),
        new ButtonBuilder()
          .setCustomId("pauseTimer")
          .setDisabled(true)
          .setEmoji("⏰")
          .setLabel("Pause Timer")
          .setStyle(2),
        new ButtonBuilder()
          .setCustomId("stopTimer")
          .setDisabled(true)
          .setEmoji("🕛")
          .setLabel("Stop Timer")
          .setStyle(2)
      ]);

      // Checking if the timer is already off

      const timerAlreadyOff = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} Error Stopping Session`)
        .setColor(colours.ERRORRED as ColorResolvable)
        .setDescription(`Specified session has already ended.`)
        .setFooter({
          text: `Session Number: ${timerData.numberOfStarts}`
        });

      if (!timerData.intiationTime) {
        // Fixing the buttons

        await originalMessage.edit({
          components: [mainButtonsRowDA]
        });

        return interaction.reply({
          embeds: [timerAlreadyOff],
          ephemeral: true
        });
      }

      // Getting the total break time

      const breakTime: number =
        timerData.sessionBreakTime > 0 ? timerData.sessionBreakTime : 0;

      // Calculating the time between the current date and the time when the session started then subtracting it from the break time
      let timeElapsed: number | string = (
        (Date.now() - timerData.intiationTime.getTime()) / 1000 -
        breakTime
      ).toFixed(3);

      if (Number(timeElapsed) <= 0)
        timeElapsed = Math.abs(Math.abs(Number(timeElapsed)) - breakTime);

      timeElapsed = Number(timeElapsed);

      // Calculating the average break time
      // Here we don't check if the numerator is 0 since 0 / Number = 0 while Number / 0 is undefined

      let averageBreakTime;

      if (timerData.sessionBreaks > 0)
        averageBreakTime = Math.abs(
          timerData.sessionBreakTime / timerData.sessionBreaks
        );
      else averageBreakTime = 0;

      // Calcuating the time difference, this is used for the session time movement quadrant

      const oldAverageTime = timerData.timeSpent / timerData.numberOfStarts;
      const newAverageTime =
        (timerData.timeSpent + timeElapsed) / (timerData.numberOfStarts + 1);

      // Calculate the change in average time
      const deltaAverageTime = newAverageTime - oldAverageTime;

      // Initialize the displayDeltaAverageTime variable, this is the variable that will be used to display the difference
      let displayDeltaAverageTime;

      // Determine the absolute value of deltaAverageTime and format it to display
      if (deltaAverageTime < 0) {
        displayDeltaAverageTime = `-${msToTime(
          Math.abs(deltaAverageTime * 1000)
        )}`;
      } else displayDeltaAverageTime = `${msToTime(deltaAverageTime * 1000)}`;

      // Calculating the XP given

      const rewardedXP = Math.round(calculateXP(Number(timeElapsed) / 60));

      await timerData.updateOne({
        seasonXP: timerData.seasonXP + rewardedXP
      });

      await userData.updateOne({
        RP: userData.RP + rewardedXP
      });

      let rankUpEmoji;

      // Checking who has the higher level

      // Checking if the user leveled up or not

      const hasRankedUpSeason: Array<number | boolean> = checkRank(
        timerData.seasonLevel,
        timerData.seasonXP,
        timerData.seasonXP + rewardedXP
      );

      const hasRankedUpAccount: Array<number | boolean> = checkRankAccount(
        userData.Rank,
        userData.RP,
        userData.RP + rewardedXP
      );

      // Creating a variable to determine if we send the level up message or not

      if (hasRankedUpSeason[0] === true)
        await client.emit(
          "playerLevelUp",
          interaction,
          interaction.user,
          "seasonLevel",
          hasRankedUpSeason[1],
          hasRankedUpSeason[2]
        );

      // Doing the same thing but for the account level

      if (hasRankedUpAccount[0] === true)
        await client.emit(
          "playerLevelUp",
          interaction,
          interaction.user,
          "accountLevel",
          hasRankedUpAccount[1],
          hasRankedUpAccount[2]
        );

      // Making the description here so it's easier to update

      const embedDescription = `• Start Time: <t:${Math.round(
        timerData.intiationTime.getTime() / 1000
      )}:F>\n• Time Elapsed: ${msToTime(
        (timeElapsed + breakTime) * 1000
      )} [${Number(
        Math.round(timeElapsed + breakTime)
      ).toLocaleString()} Seconds]\n• Session Time: ${msToTime(
        timeElapsed * 1000
      )} [${Number(
        Math.round(timeElapsed)
      ).toLocaleString()} Seconds]\n\n• Average Break Time: ${
        averageBreakTime > 0 ? msToTime(averageBreakTime * 1000) : "0 seconds"
      } [${Number(
        Math.round(averageBreakTime)
      ).toLocaleString()} Seconds]\n• Break Time: ${
        breakTime > 0 ? msToTime(breakTime * 1000) : "0 seconds"
      } [${Number(
        Math.round(breakTime)
      ).toLocaleString()} Seconds]\n• Number of Breaks: ${
        timerData.sessionBreaks
      }\n\n• Average Session Time Movement: ${displayDeltaAverageTime} [${Number(
        Math.round(deltaAverageTime)
      ).toLocaleString()} Seconds]\n\n• XP rewarded: ${Number(
        rewardedXP.toFixed(2)
      ).toLocaleString()}`;

      const longestDiff =
        timerData.longestSessionTime > timeElapsed
          ? timerData.longestSessionTime - timeElapsed
          : timeElapsed - timerData.longestSessionTime;

      // Updating the data to the DB & resetting the timer

      await timerData.updateOne({
        intiationTime: null,
        messageID: null,
        timeSpent: timerData.timeSpent + timeElapsed,
        longestSessionTime:
          timerData.longestSessionTime < timeElapsed
            ? timeElapsed
            : timerData.longestSessionTime,
        breakTime: timerData.breakTime + breakTime,
        breakTimerStart: null,
        lastSessionTime: timeElapsed,
        sessionBreaks: 0,
        sessionBreakTime: 0
      });

      await timerData.sessionLengths.push(Number(timeElapsed.toFixed(2)));
      await timerData.save();

      const longestSession = new EmbedBuilder()
        .setTitle(`${emojis.VERIFY} New Longest Session`)
        .setColor(colours.DEFAULT as ColorResolvable)
        .setDescription(
          ` ${
            interaction.user.username
          }\n\nToday's session was the longest session recorded in ${
            timerData.seasonName ? timerData.seasonName : "this semester"
          }\n\nDuration: ${msToTime(timeElapsed * 1000)}\nTime difference: ${
            longestDiff < 0
              ? "-" + msToTime(Math.abs(longestDiff * 1000))
              : msToTime(longestDiff * 1000)
          }`
        );

      if (timerData.longestSessionTime < timeElapsed)
        await interaction.channel.send({
          embeds: [longestSession]
        });

      const sessionStats = new EmbedBuilder()
        .setTitle(
          `${emojis.VERIFY} Session Ended | ${
            timerData.sessionTopic ? timerData.sessionTopic : ""
          }`
        )
        .setColor(colours.DEFAULT as ColorResolvable)
        .setDescription(`${interaction.user.username}\n\n${embedDescription}`)
        .setFooter({
          text: `Good Job`
        });

      await timerData.updateOne({
        sessionTopic: null
      });

      // Disabling the buttons

      await originalMessage.edit({
        components: [mainButtonsRowDA]
      });

      return interaction.reply({
        embeds: [sessionStats]
      });
    } else if (interaction.customId === "pauseTimer") {
      const statusCheck = checkUser(
        timerData,
        originalMessage,
        messageOwner,
        interaction
      );

      if (statusCheck === "404")
        return interaction.reply({
          embeds: [noAccount],
          ephemeral: true
        });

      if (statusCheck === "403")
        return interaction.reply({
          embeds: [noMessageData],
          ephemeral: true
        });

      if (statusCheck === "404-1") {
        await timerData.updateOne({
          messageID: null
        });

        return interaction.reply({
          embeds: [noMessage],
          ephemeral: true
        });
      }

      if (statusCheck === "403-1") {
        return interaction.reply({
          embeds: [invalidPermissions],
          ephemeral: true
        });
      }

      // Creating buttons with an un-pause button

      /**
       * @UP - Unpause Button
       */

      const mainButtonsRowUP = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setCustomId("startTimer")
          .setDisabled(true)
          .setEmoji("🕜")
          .setLabel("Start Timer")
          .setStyle(2),
        new ButtonBuilder()
          .setCustomId("unpauseTimer")
          .setEmoji("⏰")
          .setLabel("Un-pause Timer")
          .setStyle(2),
        new ButtonBuilder()
          .setCustomId("stopTimer")
          .setDisabled(true)
          .setEmoji("🕛")
          .setLabel("Stop Timer")
          .setStyle(2)
      ]);

      // Checking if the timer is already paused & off

      const timerOff = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} Error Stopping Session`)
        .setColor(colours.ERRORRED as ColorResolvable)
        .setDescription(`The timer is not on.`);

      if (!timerData.intiationTime)
        return interaction.reply({
          embeds: [timerOff],
          ephemeral: true
        });

      const timerAlreadyPaused = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} You can't do that`)
        .setColor(colours.ERRORRED as ColorResolvable)
        .setDescription(
          ` ${interaction.user.username} the timer is already paused.`
        );

      if (timerData.breakTimerStart) {
        await originalMessage.edit({
          components: [mainButtonsRowUP]
        });

        return interaction.reply({
          embeds: [timerAlreadyPaused],
          ephemeral: true
        });
      }

      // Adding the data to the DB

      await timerData.updateOne({
        breakTimerStart: new Date(Date.now()),
        sessionBreaks: timerData.sessionBreaks + 1,
        totalBreaks: timerData.totalBreaks + 1
      });

      const timerPaused = new EmbedBuilder()
        .setTitle(`${emojis.VERIFY} Success`)
        .setColor(colours.DEFAULT as ColorResolvable)
        .setDescription(
          `${interaction.user.username}\n\nThe timer has been paused, time elapsed from now till un-pause time won't be counted.\nTo un-pause use the buttons on the [original message](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${timerData.messageID} "Easter egg number 2!")`
        );

      await originalMessage.edit({
        components: [mainButtonsRowUP]
      });

      return interaction.reply({
        embeds: [timerPaused]
      });
    } else if (interaction.customId === "unpauseTimer") {
      const statusCheck = checkUser(
        timerData,
        originalMessage,
        messageOwner,
        interaction
      );

      if (statusCheck === "404")
        return interaction.reply({
          embeds: [noAccount],
          ephemeral: true
        });

      if (statusCheck === "403")
        return interaction.reply({
          embeds: [noMessageData],
          ephemeral: true
        });

      if (statusCheck === "404-1") {
        await timerData.updateOne({
          messageID: null
        });

        return interaction.reply({
          embeds: [noMessage],
          ephemeral: true
        });
      }

      if (statusCheck === "403-1") {
        return interaction.reply({
          embeds: [invalidPermissions],
          ephemeral: true
        });
      }

      // Checking if the timer is paused

      const timerNotPaused = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} You can't do that`)
        .setColor(colours.ERRORRED as ColorResolvable)
        .setDescription(`The timer is not paused.`);

      const mainButtonsRowDS = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setCustomId("startTimer")
          .setDisabled(true)
          .setEmoji("🕜")
          .setLabel("Start Timer")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("pauseTimer")
          .setEmoji("⏰")
          .setLabel("Pause Timer")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("stopTimer")
          .setEmoji("🕛")
          .setLabel("Stop Timer")
          .setStyle(ButtonStyle.Secondary)
      ]);

      if (!timerData.breakTimerStart) {
        await originalMessage.edit({
          components: [mainButtonsRowDS]
        });

        return interaction.reply({
          embeds: [timerNotPaused],
          ephemeral: true
        });
      }

      // Calculating the break time

      const timeElapsed = Math.round(
        Number(
          Math.abs((Date.now() - timerData.breakTimerStart.getTime()) / 1000)
        )
      );

      // Adding that data to the DB

      await timerData.updateOne({
        sessionBreakTime: timerData.sessionBreakTime + timeElapsed,
        breakTimerStart: null
      });

      const timerUnpaused = new EmbedBuilder()
        .setTitle(`${emojis.VERIFY} Success`)
        .setColor(colours.DEFAULT as ColorResolvable)
        .setDescription(
          `${
            interaction.user.username
          }\n\nSession timer has been un-paused\n\n• Break Time: ${msToTime(
            timeElapsed * 1000
          )} [${timeElapsed.toLocaleString()} Seconds]\n• This is break number ${
            timerData.sessionBreaks
          }`
        );

      await originalMessage.edit({
        components: [mainButtonsRowDS]
      });

      return interaction.reply({
        embeds: [timerUnpaused]
      });
    }
  });
};
