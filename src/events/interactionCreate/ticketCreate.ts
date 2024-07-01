import { db } from "$src/utils/db.js";
import { ActionRowBuilder, BaseGuildTextChannel, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, Colors, EmbedBuilder, GuildTextThreadManager, ThreadChannel } from "discord.js";
import config from '../../config.json'

export default {
  async execute(interaction: ButtonInteraction) {
    if (interaction.customId === "openTicket") {

        const alreadyHaveATicket = await db.ticket.findFirst({ where: { userId: interaction.user.id }})

        if(alreadyHaveATicket) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setDescription('**Du hast bereits ein Ticket offen**')
                .setColor(Colors.Red)
            ],
            ephemeral: true
        })

        //@ts-ignore
        const thread: ThreadChannel = await interaction.channel?.threads.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.PrivateThread
        })

        thread.members.add(interaction.user.id)

        thread.send({
            embeds: [
                new EmbedBuilder()
                .setTitle(`Hallo ${interaction.user.username},`)
                .setDescription('unser Team wird sich in kürze um dich kümmern beschreibe in Zwischenzeit dein Problem')
                .setColor(Colors.Blue)
            ],
            components: [
                //@ts-ignore
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('closeTicket')
                    .setEmoji('🗑')
                    .setLabel('Schließen')
                    .setStyle(ButtonStyle.Danger)
                )
            ]
        })

        const channel = await interaction.guild?.channels.fetch(config.ticket.joinMessageChannelId)
        //@ts-ignore
        const joinMessage = await channel?.send({
            embeds: [
                new EmbedBuilder()
                .setTitle(`Ticket ${interaction.user.username}`)
                .setDescription('Ein Ticket wurde geöffnet klicke auf den Button unter dieser Nachricht um dem Ticket zu joinen')
                .setColor(Colors.Blue)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('joinTicket')
                    .setLabel('Join')
                    .setEmoji('➕')
                    .setStyle(ButtonStyle.Success)
                )
            ]
        })

        await db.ticket.create({ data: { userId: interaction.user.id, ticketId: thread.id, joinId: joinMessage.id}})

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setDescription(`**Du hast erfolgreich ein Ticket erstellt |** <#${thread.id}>`)
                .setColor(Colors.Green)
            ],
            ephemeral: true
        })

    }
    
    if (interaction.customId === "joinTicket") {

        const ticket = await db.ticket.findFirst({ where: { joinId: interaction.message?.id}})
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
                .setDescription(`<:rot:1250894634134147144> **Dieses Ticket existiert nicht mehr**`)
                .setColor(Colors.Red),
            ],
            ephemeral: true,
          });
  
        thread.members.add(interaction.user.id);
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `<:grn:1250894631848120362> **Du wurdest erfolgreich zum Ticket hinzugefügt**`
              )
              .setColor(Colors.Green),
          ],
          ephemeral: true,
        });
    }

    if (interaction.customId === "closeTicket") {
      //@ts-ignore
      if (!interaction.member?.roles.cache.has("1210600954311745576"))
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `<:rot:1250894634134147144> **Du hast nicht die Rechte ein Ticket zu schließen**`
              )
              .setColor(Colors.Red),
          ],
          ephemeral: true,
        });

      const ticketConfig = await db.ticket.findFirst({ where: { ticketId: interaction.channel?.id}})

      try {

        const channel = await interaction.guild?.channels.fetch(config.ticket.joinMessageChannelId) as BaseGuildTextChannel
        const message = await channel.messages.fetch(ticketConfig?.joinId as string)

        message?.edit({ components: [
          //@ts-ignore
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('KeineAhnungWarum')
              .setLabel(`Ticket geschlossen von ${interaction.user.username}`)
              .setEmoji('❕')
              .setStyle(ButtonStyle.Danger)
              .setDisabled(true)
          )
        ]})
      }
      catch(e){}
      
      await db.ticket.deleteMany({
        where: { ticketId: interaction.channel?.id },
      });

      //@ts-ignore
      await interaction.channel.delete();
    }
  },
};
