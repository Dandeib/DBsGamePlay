import { db } from "$src/utils/db.js";
import { ActionRowBuilder, BaseGuildTextChannel, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, Colors, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import config from '../../config.json'

export default {
  async execute(interaction: ButtonInteraction | ModalSubmitInteraction) {
    if(interaction.isButton() && interaction.customId === 'openunbanTicket') {

      const modal = new ModalBuilder()
      .setCustomId('unbanModal')
      .setTitle('Entbannungs Antrag')

      const ingameName = new ActionRowBuilder()
      .addComponents(
        new TextInputBuilder()
        .setCustomId('ingameName')
        .setLabel('Ingame Name')
        .setPlaceholder('Dein Minecraft Spieler Name')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
      )

      const banReason = new ActionRowBuilder()
      .addComponents(
        new TextInputBuilder()
        .setCustomId('banReason')
        .setLabel('Ban Grund')
        .setPlaceholder('Der Grund wieso du gebannt wurdest')
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)
      )

      const bannedSince = new ActionRowBuilder()
      .addComponents(
        new TextInputBuilder()
        .setCustomId('bannedSince')
        .setLabel('Gebannt seit')
        .setPlaceholder('Seit wann bist du gebannt')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
      )

      const bannedTime = new ActionRowBuilder()
      .addComponents(
        new TextInputBuilder()
        .setCustomId('bannedTime')
        .setLabel('Ban Dauer')
        .setPlaceholder('Die Dauer deines bannes')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
      )

      modal.addComponents(
        //@ts-ignore
        ingameName,
        banReason,
        bannedSince,
        bannedTime
      )

      await interaction.showModal(modal)
    }
    if(interaction.isModalSubmit() && interaction.customId === 'unbanModal') {
      
      const ingameName = interaction.fields.getTextInputValue('ingameName')
      const banReason = interaction.fields.getTextInputValue('banReason')
      const bannedSince = interaction.fields.getTextInputValue('bannedSince')
      const bannedTime = interaction.fields.getTextInputValue('bannedTime')

      const alreadyHaveATicket = await db.unban.findFirst({ where: { userId: interaction.user.id }})

      if(alreadyHaveATicket) return interaction.reply({
          embeds: [
              new EmbedBuilder()
              .setDescription('<:rot:1250894634134147144> **Du hast bereits ein Entbannungs Antrag offen**')
              .setColor(Colors.Red)
          ],
          ephemeral: true
      })

      //@ts-ignore
      const thread: ThreadChannel = await interaction.channel?.threads.create({
          name: `unban-${interaction.user.username}`,
          type: ChannelType.PrivateThread
      })

      thread.members.add(interaction.user.id)

      thread.send({
          embeds: [
              new EmbedBuilder()
              .setTitle(`Hallo ${interaction.user.username},`)
              .setDescription(`unser Team wird in kürze da sein, schreibe in der Zwischenzeit einen Entbannungsantrag bzw. eine Entschuldigung\n\n **__Details:__**\n- **Ingame Name:** ${ingameName}\n- **Gebannt für:** ${banReason}\n- **Gebannt seit:** ${bannedSince}\n- **Ban Zeit:** ${bannedTime}`)
              .setColor(Colors.Red)
          ],
          components: [
              //@ts-ignore
              new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder()
                  .setCustomId('closeUnban')
                  .setEmoji('🗑')
                  .setLabel('Schließen')
                  .setStyle(ButtonStyle.Danger)
              )
          ]
      })

      const channel = await interaction.guild?.channels.fetch(config.unban.joinMessageChannelId)
      //@ts-ignore
      const joinMessage = await channel?.send({
          embeds: [
              new EmbedBuilder()
              .setTitle(`Entbannungs Antrag ${interaction.user.username}`)
              .setDescription('Ein Entbannungs Antrag wurde gestellt klicke auf den Button unter dieser Nachricht um dem Ticket zu joinen')
              .setColor(Colors.Red)
          ],
          components: [
              new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder()
                  .setCustomId('joinUnban')
                  .setLabel('Join')
                  .setEmoji('➕')
                  .setStyle(ButtonStyle.Success)
              )
          ]
      })

      await db.unban.create({ data: { userId: interaction.user.id, ticketId: thread.id, joinId: joinMessage.id}})

      interaction.reply({
          embeds: [
              new EmbedBuilder()
              .setDescription(`<:grn:1250894631848120362> **Du hast erfolgreich ein Ticket erstellt |** <#${thread.id}>`)
              .setColor(Colors.Green)
          ],
          ephemeral: true
      })
    }

    if (interaction.isButton() && interaction.customId === "joinUnban") {

      const ticket = await db.unban.findFirst({ where: { joinId: interaction.message?.id}})
      const threadId = ticket?.ticketId

      const ticketChannel = await interaction.guild?.channels.fetch(config.ticket.threadTicketChannelId);
      
      //@ts-ignore
      const thread = await ticketChannel.threads.cache.find(
        (x: any) => x.id === threadId
      );

      if (!thread)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`<:rot:1250894634134147144> **Dieser Entbannungs Antrag existiert nicht mehr**`)
              .setColor(Colors.Red),
          ],
          ephemeral: true,
        });

      thread.members.add(interaction.user.id);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `<:grn:1250894631848120362> **Du wurdest erfolgreich zum Entbannungs Antrag hinzugefügt**`
            )
            .setColor(Colors.Green),
        ],
        ephemeral: true,
      });
    }

    if (interaction.isButton() && interaction.customId === "closeUnban") {
      //@ts-ignore
      if (!interaction.member?.roles.cache.has("1210600954311745576"))
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `<:rot:1250894634134147144> **Du hast nicht die Rechte ein Entbannungs Antrag zu schließen**`
              )
              .setColor(Colors.Red),
          ],
          ephemeral: true,
        });

      const ticketConfig = await db.unban.findFirst({ where: { ticketId: interaction.channel?.id}})

      try {

        const channel = await interaction.guild?.channels.fetch(config.unban.joinMessageChannelId) as BaseGuildTextChannel
        const message = await channel.messages.fetch(ticketConfig?.joinId as string)

        message?.edit({ components: [
          //@ts-ignore
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('KeineAhnungWarum')
              .setLabel(`Entbannungs Antrag geschlossen von ${interaction.user.username}`)
              .setEmoji('❕')
              .setStyle(ButtonStyle.Danger)
              .setDisabled(true)
          )
        ]})
      }
      catch(e){}
      
      await db.unban.deleteMany({
        where: { ticketId: interaction.channel?.id },
      });

      //@ts-ignore
      await interaction.channel.delete();
    }
  }
}