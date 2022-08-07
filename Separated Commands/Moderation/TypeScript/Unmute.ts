  options: [
    {
      name: "user",
      description: "The user you want to unmute",
      type: Constants.ApplicationCommandOptionTypes.USER,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the unmute",
      type: Constants.ApplicationCommandOptionTypes.STRING,
    },
  ]

   const targetUser = interaction.options.getUser("user", true);
    const unmuteReason =
      interaction.options.getString("reason") || "No reason provided";

    const targetMember = interaction.guild?.members.cache.get(
      targetUser.id
    ) as GuildMember;

    if (!targetMember)
      return interaction.reply({
        content: `The user provided is not in ${interaction.guild?.name}`,
        ephemeral: true,
      });

    if (targetMember.id === interaction.user.id)
      return interaction.reply({
        content: `You can't unmute yourself, sucks to suck.`,
        ephemeral: true,
      });

    const notMuted = new MessageEmbed()
      .setTitle(titles.USER_ERROR)
      .setColor(colours.ErrorRed as ColorResolvable)
      .setDescription(`The user provided is not muted / timed out`)
      .setFooter({
        text: `${interaction.guild?.name} moderation powered by GBF`,
        iconURL: interaction.guild?.iconURL() as string,
      })
      .setTimestamp();

    if (!targetMember.isCommunicationDisabled())
      return interaction.reply({
        embeds: [notMuted],
        ephemeral: true,
      });

    const unmetPerms = new MessageEmbed()
      .setTitle(titles.USER_ERROR)
      .setColor(colours.ErrorRed as ColorResolvable)
      .setDescription(
        `The user that you are trying to unmute is higher than I am in the role hierarchy, meaning that I cannot moderate them.`
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
        `The user that you are trying to unmute is higher than you are in the role hierarchy.`
      )
      .setFooter({
        text: `${interaction.guild?.name} moderation powered by GBF`,
        iconURL: interaction.guild?.iconURL() as string,
      })
      .setTimestamp();

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

    const successUnmute = new MessageEmbed()
      .setTitle(titles.SUCCESS)
      .setColor(colours.Default as ColorResolvable)
      .setDescription(
        `**Successfully unmuted:** ${targetMember}\n**Their mute was going to end:** <t:${Math.round(
          targetMember.communicationDisabledUntilTimestamp / 1000
        )}:F>\n**Unmute reason:** ${unmuteReason}`
      )
      .setFooter({
        text: `${interaction.guild?.name} moderation powered by GBF`,
        iconURL: interaction.guild?.iconURL() as string,
      })
      .setTimestamp();

    await targetMember.disableCommunicationUntil(0, unmuteReason);

    return interaction.reply({
      embeds: [successUnmute],
    });
