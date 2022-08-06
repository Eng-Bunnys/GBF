 options: [
    {
      name: "target",
      description: "The user that you want to mute",
      type: Constants.ApplicationCommandOptionTypes.USER,
      required: true,
    },
    {
      name: "duration",
      description: "The time that you want to mute the user for",
      minValue: 1,
      type: Constants.ApplicationCommandOptionTypes.NUMBER,
      required: true,
    },
    {
      name: "unit",
      description: "The unit of time that you want to mute the user for",
      type: Constants.ApplicationCommandOptionTypes.STRING,
      choices: [
        {
          name: "Seconds",
          value: "s",
        },
        {
          name: "Minutes",
          value: "m",
        },
        {
          name: "Hours",
          value: "h",
        },
        {
          name: "Days",
          value: "d",
        },
      ],
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the mute",
      type: Constants.ApplicationCommandOptionTypes.STRING,
    },
  ],

    const targetMember = interaction.options.getMember(
      "target",
      true
    ) as GuildMember;
    const durationNumber = interaction.options.getNumber("duration", true);
    const durationUnit = interaction.options.getString("unit", true);
    const muteReason =
      interaction.options.getString("reason") || "No reason provided";

    const unmetPerms = new MessageEmbed()
      .setTitle(titles.USER_ERROR)
      .setColor(colours.ErrorRed as ColorResolvable)
      .setDescription(
        `The user that you are trying to mute is higher than I am in the role hierarchy, meaning that I cannot moderate them.`
      )
      .setFooter({
        text: `${interaction.guild?.name} moderation powered by GBF`,
        iconURL: interaction.guild?.iconURL() as string,
      })
      .setTimestamp();

    const userIsLower = new MessageEmbed()
      .setTitle(titles.USER_ERROR)
      .setColor(colours.ErrorRed as ColorResolvable)
      .setDescription(
        `The user that you are trying to mute is higher than you are in the role hierarchy.`
      )
      .setFooter({
        text: `${interaction.guild?.name} moderation powered by GBF`,
        iconURL: interaction.guild?.iconURL() as string,
      })
      .setTimestamp();

    if (targetMember.id === interaction.user.id)
      return interaction.reply({
        content: `Why would you want to mute yourself? 🤔`,
        ephemeral: true,
      });

    if (!targetMember.manageable || !targetMember.moderatable)
      return interaction.reply({
        embeds: [unmetPerms],
        ephemeral: true,
      });

    if (
      targetMember.roles.highest.position >
      (interaction.member! as GuildMember).roles.highest.position
    )
      return interaction.reply({
        embeds: [userIsLower],
        ephemeral: true,
      });

    let muteDuration: number;

    if (durationUnit === "s") muteDuration = 1000 * durationNumber;
    else if (durationUnit === "m") muteDuration = 1000 * 60 * durationNumber;
    else if (durationUnit === "h")
      muteDuration = 1000 * 60 * 60 * durationNumber;
    else if (durationUnit === "d")
      muteDuration = 1000 * 60 * 60 * 24 * durationNumber;
    else muteDuration = durationNumber;

    const muteTooBig = new MessageEmbed()
      .setTitle(titles.USER_ERROR)
      .setColor(colours.ErrorRed as ColorResolvable)
      .setDescription(
        `The duration of the mute is too long. The maximum duration is 14 days (1.21e+9 milliseconds)`
      )
      .setFooter({
        text: `${interaction.guild?.name} moderation powered by GBF`,
        iconURL: interaction.guild?.iconURL() as string,
      })
      .setTimestamp();

    if (targetMember.isCommunicationDisabled()) {
      const targetMutedUntil =
        targetMember.communicationDisabledUntil?.getTime() -
        new Date().getTime();
      muteDuration += targetMutedUntil;
    }

    if (muteDuration >= 1209600000)
      return interaction.reply({
        embeds: [muteTooBig],
        ephemeral: true,
      });

    const displayMuteDuration = duration(muteDuration, {
      units: ["y", "mo", "w", "d", "h", "m", "s"],
      round: true,
    });

    const targetMuted = new MessageEmbed()
      .setTitle(titles.SUCCESS)
      .setColor(colours.Default as ColorResolvable)
      .setDescription(`${targetMember.user.username} has been muted`)
      .addFields(
        {
          name: "Moderator",
          value: `${interaction.user}`,
          inline: true,
        },
        {
          name: "Target",
          value: `${targetMember.user}`,
          inline: true,
        },
        {
          name: "Mute Duration",
          value: `${displayMuteDuration}`,
          inline: true,
        },
        {
          name: "Reason",
          value: `${muteReason}`,
          inline: true,
        },
        {
          name: "\u200b",
          value: "\u200b",
          inline: true,
        },
        {
          name: "\u200b",
          value: "\u200b",
          inline: true,
        }
      )
      .setFooter({
        text: `${interaction.guild?.name} moderation powered by GBF`,
        iconURL: interaction.guild?.iconURL() as string,
      })
      .setTimestamp();

    let dateMuteDuration: DateResolvable;

    dateMuteDuration = new Date(Date.now() + muteDuration);

    await targetMember.disableCommunicationUntil(dateMuteDuration, muteReason);

    return interaction.reply({
      embeds: [targetMuted],
    });
