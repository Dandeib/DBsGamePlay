import { db } from "$src/utils/db.js";
import { ActionRowBuilder, BaseGuildTextChannel, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, EmbedBuilder } from "discord.js";
import config from '../../config.json'

export default {
  async execute(interaction: ButtonInteraction) {
    if(interaction.customId === 'closeBewerbung') {
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

      const ticketConfig = await db.form.findFirst({ where: { ticketId: interaction.channel?.id}})

      try {
        
        const channel = await interaction.guild?.channels.fetch(config.bewerbung.joinMessageChannelId) as BaseGuildTextChannel
        const message = await channel.messages.fetch(ticketConfig?.joinId as string)

        await message?.edit({ components: [
          new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('KeineAhnungWarum')
              .setLabel(`Bewerbung geschlossen von ${interaction.user.username}`)
              .setEmoji('❕')
              .setStyle(ButtonStyle.Danger)
              .setDisabled(true)
          )
        ]})
      }
      catch(e){}
      
      await db.form.deleteMany({
        where: { ticketId: interaction.channel?.id },
      });
   
      await interaction.channel?.delete();
    }

    if (interaction.customId === "joinBewerbung") {

      const ticket = await db.form.findFirst({ where: { joinId: interaction.message?.id}})
      const threadId = ticket?.ticketId

      const ticketChannel = await interaction.guild?.channels.fetch(config.bewerbung.threadTicketChannelId);
      
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
  }
}