  options: [
    {
      name: "user",
      description: "The user that you want to get their avatar",
      type: Constants.ApplicationCommandOptionTypes.USER,
    },
  ],

    const targetUser = interaction.options.getUser("user") || interaction.user;

    const avatarEmbed = new MessageEmbed()
      .setTitle(`${targetUser.tag}'s avatar`)
      .setColor("#e91e63")
      .setImage(
        targetUser.displayAvatarURL({
          format: "png",
          dynamic: true,
          size: 1024,
        })
      )
      .setFooter({
        text: `Requested by: ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    const avatarButtons = new MessageActionRow().setComponents(
      new MessageButton()
        .setLabel(`Global Avatar Link`)
        .setStyle("LINK")
        .setURL(targetUser.displayAvatarURL())
    );

    const targetMember = await interaction.guild?.members.fetch(targetUser.id);

    if (targetMember?.displayAvatarURL() !== targetUser.displayAvatarURL()) {
      avatarEmbed.setDescription(
        `[Global Avatar URL](${targetUser.displayAvatarURL()}) | [Server Avatar URL](${targetMember?.displayAvatarURL(
          {
            size: 1024,
          }
        )})`
      );
      avatarEmbed.setThumbnail(
        targetMember!.displayAvatarURL({
          format: "png",
          dynamic: true,
          size: 1024,
        })
      );
      avatarButtons.setComponents(
        new MessageButton()
          .setLabel(`Server Avatar Link`)
          .setStyle("LINK")
          .setURL(
            targetMember!.displayAvatarURL({
              size: 1024,
            })
          )
      );
    } else
      avatarEmbed.setDescription(
        `[Global Avatar URL](${targetUser.displayAvatarURL({
          size: 1024,
        })})`
      );

    return interaction.reply({
      embeds: [avatarEmbed],
      components: [avatarButtons],
    });
