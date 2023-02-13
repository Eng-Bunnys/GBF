const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Message
} = require("discord.js");

const title = require("../gbfembedmessages.json");
const colours = require("../GBFColor.json");
const emojis = require("../GBFEmojis.json");

const timerSchema = require("../schemas/GBF Schemas/timer schema");

const { msToTime } = require("../utils/engine");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
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

    // If the user's data does not exist we return EMBED

    const noAccount = new MessageEmbed()
      .setTitle(`${emojis.ERROR} 404 Not Found`)
      .setColor(colours.ERRORRED)
      .setDescription(
        `I couldn't find any data matching your user ID.\n\nCreate a new semester account using </timer registry:1068210539689414777>.`
      );

    if (!timerData)
      return interaction.reply({
        embeds: [noAccount],
        ephemeral: true
      });

    // Checking if the user initiated using message IDs EMBED

    const noMessageData = new MessageEmbed()
      .setTitle(`${emojis.ERROR} 403 Forbidden`)
      .setColor(colours.ERRORRED)
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

    const noMessage = new MessageEmbed()
      .setTitle(`${emojis.ERROR} 404-1 Not Found`)
      .setColor(colours.ERRORRED)
      .setDescription(
        `The session initiation message tied to this account was not found, please use</timer initiate:1068210539689414777> to start a new session or create a new initiation message.`
      );

    // Checking if the user who used the button is the same user who used the command

    const invalidPermissions = new MessageEmbed()
      .setTitle(`${emojis.ERROR} 403-1 Forbidden`)
      .setColor(colours.ERRORRED)
      .setDescription(
        `You can't use that, create your own using </timer registry:1068210539689414777>.`
      );

    function checkUser(data, message, originalUser, interaction) {
      let status;
      if (!data) return (status = "404");
      else if (data && !data.messageID) return (status = "403");
      if (data && !message) return (status = "404-1");
      if (data && !originalUser) return (status = "404-1");
      if (
        data &&
        message &&
        originalUser &&
        originalUser.userID !== interaction.user.id
      )
        return (status = "403-1");
      else return (status = "200");
    }

    // Function that calculates the amount of XP required to level up
    function xpRequired(level) {
      return level * 400 + (level - 1) * 200 - 300;
    }

    function xpRequiredAccount(level) {
      return level * 800 + (level - 1) * 400 - 500;
    }

    // Function that gives the user XP dependant on the time spent

    /**
     * @param {time} - Used to calculate the XP given, every 5 minutes is 10 XP
     */

    function calculateXP(time) {
      return Math.floor(time / 5) * 10;
    }

    // Function from GBF's engine that calculates the levels given

    /**
     * @param {currentRank} - The user's current level
     * @param {currentRP} - The user's XP before any additions
     * @param {addedRP} - currentRP + the XP rewarded
     * @returns - [Boolean if the user has ranked up [0], Number of level ups [1], Remaining XP that was extra [2]]
     */

    function checkRank(currentRank, currentRP, addedRP) {
      let addedLevels = 0;
      let hasRankedUp = false;

      let requiredRP = xpRequired(currentRank + addedLevels, currentRP);

      if (addedRP > requiredRP) {
        hasRankedUp = true;
        addedLevels++;
      }

      let remainingRP = addedRP - requiredRP;
      if (Math.abs(remainingRP) === remainingRP && remainingRP > requiredRP) {
        for (remainingRP; remainingRP > requiredRP; remainingRP -= requiredRP) {
          addedLevels++;
          if (currentRank + addedLevels >= 5000) {
            addedLevels--;
            break;
          }
          requiredRP = xpRequired(currentRank + addedLevels, currentRP);
        }
      }
      if (Math.abs(remainingRP) !== remainingRP) remainingRP = 0;
      return [hasRankedUp, addedLevels, remainingRP];
    }

    function checkRankAccount(currentRank, currentRP, addedRP) {
      let addedLevels = 0;
      let hasRankedUp = false;

      let requiredRP = xpRequiredAccount(currentRank + addedLevels, currentRP);

      if (addedRP > requiredRP) {
        hasRankedUp = true;
        addedLevels++;
      }

      let remainingRP = addedRP - requiredRP;
      if (Math.abs(remainingRP) === remainingRP && remainingRP > requiredRP) {
        for (remainingRP; remainingRP > requiredRP; remainingRP -= requiredRP) {
          addedLevels++;
          if (currentRank + addedLevels >= 5000) {
            addedLevels--;
            break;
          }
          requiredRP = xpRequiredAccount(currentRank + addedLevels, currentRP);
        }
      }
      if (Math.abs(remainingRP) !== remainingRP) remainingRP = 0;
      return [hasRankedUp, addedLevels, remainingRP];
    }

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

      const mainButtonsRowDS = new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("startTimer")
          .setDisabled(true)
          .setEmoji("🕜")
          .setLabel("Start Timer")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("pauseTimer")
          .setEmoji("⏰")
          .setLabel("Pause Timer")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("stopTimer")
          .setEmoji("🕛")
          .setLabel("Stop Timer")
          .setStyle("SECONDARY")
      ]);

      // Checking if the timer was already on

      const timerAlreadyOn = new MessageEmbed()
        .setTitle(`${emojis.ERROR} Error Starting Session`)
        .setColor(colours.ERRORRED)
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

      const timerStarted = new MessageEmbed()
        .setTitle(`${emojis.VERIFY} Success`)
        .setColor(colours.DEFAULT)
        .setDescription(`Timer started, best of luck.`);

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

      const mainButtonsRowDA = new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("startTimer")
          .setDisabled(true)
          .setEmoji("🕜")
          .setLabel("Start Timer")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("pauseTimer")
          .setDisabled(true)
          .setEmoji("⏰")
          .setLabel("Pause Timer")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("stopTimer")
          .setDisabled(true)
          .setEmoji("🕛")
          .setLabel("Stop Timer")
          .setStyle("SECONDARY")
      ]);

      // Checking if the timer is already off

      const timerAlreadyOff = new MessageEmbed()
        .setTitle(`${emojis.ERROR} Error Stopping Session`)
        .setColor(colours.ERRORRED)
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

      const breakTime =
        timerData.sessionBreakTime > 0 ? timerData.sessionBreakTime : 0;

      // Calculating the time between the current date and the time when the session started then subtracting it from the break time

      let timeElapsed =
        ((Date.now() - timerData.intiationTime.getTime()) / 1000).toFixed(3) -
        breakTime;

      if (timeElapsed <= 0)
        timeElapsed = Math.abs(Math.abs(timeElapsed) - breakTime);

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

      const rewardedXP = Math.round(calculateXP(timeElapsed / 60));

      await timerData.updateOne({
        seasonXP: timerData.seasonXP + rewardedXP,
        accountXP: timerData.accountXP + rewardedXP
      });

      let rankUpEmoji;

      // Checking who has the higher level

      let highestLevel =
        timerData.seasonLevel > timerData.accountLevel
          ? timerData.seasonLevel
          : timerData.accountLevel;

      highestLevel++;

      if (highestLevel <= 25) rankUpEmoji = `<a:W_:805604232354332704>`;
      else if (highestLevel > 25 && highestLevel <= 50)
        rankUpEmoji = `<a:blackSpin:1025851052442005594>`;
      else if (highestLevel > 50 && highestLevel <= 75)
        rankUpEmoji = `<a:redSpin:1025851361583173773>`;
      else if (highestLevel > 75 && highestLevel < 100)
        rankUpEmoji = `<a:pinkSpin:1025851222068052101>`;
      else if (highestLevel === 100)
        rankUpEmoji = `<a:100_Streak_Badge:963696947015864340>`;
      else if (highestLevel > 100)
        rankUpEmoji = `<a:donutSpin:1025851417421955204>`;

      // Checking if the user leveled up or not

      const hasRankedUpSeason = checkRank(
        timerData.seasonLevel,
        timerData.seasonXP,
        timerData.seasonXP + rewardedXP
      );

      const hasRankedUpAccount = xpRequiredAccount(
        timerData.accountLevel,
        timerData.accountXP,
        timerData.seasonXP + rewardedXP
      );

      const leveledUpMessage = new MessageEmbed()
        .setTitle(`${rankUpEmoji} Ranked Up`)
        .setColor(colours.DEFAULT);

      let hasRankedUpMessage = ``;

      // If the user's seasonal level has increased

      // Creating a variable to determine if we send the level up message or not

      let sendRankUp = false;

      // Creating a progress bar

      let seasonProgressBar;

      const percentageSeasonComplete =
        (hasRankedUpSeason[2] / xpRequired(timerData.seasonLevel + 2)) * 100;

      if (percentageSeasonComplete >= 50 && percentageSeasonComplete < 90)
        seasonProgressBar = `${emojis.leftFull}${emojis.middleFull}${emojis.rightEmpty}`;
      else if (percentageSeasonComplete >= 25 && percentageSeasonComplete < 50)
        seasonProgressBar = `${emojis.leftFull}${emojis.middleEmpty}${emojis.rightEmpty}`;
      else if (percentageSeasonComplete >= 99)
        seasonProgressBar = `${emojis.leftFull}${emojis.middleFull}${emojis.rightFull}`;
      else if (percentageSeasonComplete < 25)
        seasonProgressBar = `${emojis.leftEmpty}${emojis.middleEmpty}${emojis.rightEmpty}`;

      if (hasRankedUpSeason[0] === true) {
        hasRankedUpMessage =
          hasRankedUpMessage +
          `• New Season Level: \`${
            timerData.seasonLevel + 1
          }\`\n• Season XP: \`${
            hasRankedUpSeason[2]
          }\`\n• XP required to reach level ${
            timerData.seasonLevel + 2
          }: \`${xpRequired(
            timerData.seasonLevel + 2
          ).toLocaleString()}\`\n• Season Level Progress: ${seasonProgressBar} \`[${percentageSeasonComplete.toFixed(
            2
          )} %]\`\n\n`;

        sendRankUp = true;

        await timerData.updateOne({
          seasonLevel: timerData.seasonLevel + 1,
          seasonXP: Number(hasRankedUpSeason[2])
        });
      }

      // Doing the same thing but for the account level

      let accountProgressBar;

      const percentageAccountComplete =
        (hasRankedUpAccount[2] /
          xpRequiredAccount(timerData.accountLevel + 2)) *
        100;

      if (percentageAccountComplete >= 50 && percentageAccountComplete < 90)
        accountProgressBar = `${emojis.leftFull}${emojis.middleFull}${emojis.rightEmpty}`;
      else if (
        percentageAccountComplete >= 25 &&
        percentageAccountComplete < 50
      )
        accountProgressBar = `${emojis.leftFull}${emojis.middleEmpty}${emojis.rightEmpty}`;
      else if (percentageAccountComplete >= 99)
        accountProgressBar = `${emojis.leftFull}${emojis.middleFull}${emojis.rightFull}`;
      else if (percentageAccountComplete < 25)
        accountProgressBar = `${emojis.leftEmpty}${emojis.middleEmpty}${emojis.rightEmpty}`;

      if (hasRankedUpAccount[0] === true) {
        hasRankedUpMessage =
          hasRankedUpMessage +
          `• New Account Level: \`${
            timerData.accountLevel + 1
          }\`\n• Account XP: \`${
            hasRankedUpAccount[2]
          }\`\n• XP required to reach level ${
            timerData.accountLevel + 2
          }: \`${xpRequiredAccount(
            timerData.accountLevel + 2
          ).toLocaleString()}\`\n• Account Level Progress: ${accountProgressBar} \`[${percentageAccountComplete.toFixed(
            2
          )} %]\``;

        sendRankUp = true;

        await timerData.updateOne({
          accountLevel: timerData.seasonLevel + 1,
          accountXP: Number(hasRankedUpSeason[2])
        });
      }

      leveledUpMessage.setDescription(`${hasRankedUpMessage}`);

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

      const longestSession = new MessageEmbed()
        .setTitle(`${emojis.VERIFY} New Longest Session`)
        .setColor(colours.DEFAULT)
        .setDescription(
          `Today's session was the longest session recorded in ${
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

      const sessionStats = new MessageEmbed()
        .setTitle(
          `${emojis.VERIFY} Session Ended | ${
            timerData.sessionTopic ? timerData.sessionTopic : ""
          }`
        )
        .setColor(colours.DEFAULT)
        .setDescription(`${embedDescription}`)
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

      if (sendRankUp === true) {
        await interaction.reply({
          content: `<@${timerData.userID}>`,
          embeds: [leveledUpMessage]
        });

        return interaction.followUp({
          embeds: [sessionStats]
        });
      } else
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

      const mainButtonsRowUP = new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("startTimer")
          .setDisabled(true)
          .setEmoji("🕜")
          .setLabel("Start Timer")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("unpauseTimer")
          .setEmoji("⏰")
          .setLabel("Un-pause Timer")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("stopTimer")
          .setDisabled(true)
          .setEmoji("🕛")
          .setLabel("Stop Timer")
          .setStyle("SECONDARY")
      ]);

      // Checking if the timer is already paused

      const timerAlreadyPaused = new MessageEmbed()
        .setTitle(`${emojis.ERROR} You can't do that`)
        .setColor(colours.ERRORRED)
        .setDescription(`The timer is already paused.`);

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

      const timerPaused = new MessageEmbed()
        .setTitle(`${emojis.VERIFY} Success`)
        .setColor(colours.DEFAULT)
        .setDescription(
          `The timer has been paused, time elapsed from now till un-pause time won't be counted.\nTo un-pause use the buttons on the [original message](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${timerData.messageID} "Easter egg number 2!")`
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

      const timerNotPaused = new MessageEmbed()
        .setTitle(`${emojis.ERROR} You can't do that`)
        .setColor(colours.ERRORRED)
        .setDescription(`The timer is not paused.`);

      const mainButtonsRowDS = new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("startTimer")
          .setDisabled(true)
          .setEmoji("🕜")
          .setLabel("Start Timer")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("pauseTimer")
          .setEmoji("⏰")
          .setLabel("Pause Timer")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("stopTimer")
          .setEmoji("🕛")
          .setLabel("Stop Timer")
          .setStyle("SECONDARY")
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

      const timerUnpaused = new MessageEmbed()
        .setTitle(`${emojis.VERIFY} Success`)
        .setColor(colours.DEFAULT)
        .setDescription(
          `Session timer has been un-paused\n\n• Break Time: ${msToTime(
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
