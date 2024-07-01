import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder } from "discord.js";
import config from "../../config.json"
import { db } from "$src/utils/db.js";

export default {
  async execute(interaction: StringSelectMenuInteraction | ButtonInteraction) {

    if(interaction.isButton() && interaction.customId === 'formSelect') {

      const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('formSelected')
      .setPlaceholder('Als was willst du dich bewerben')

      if(config.form.dev.active) {
        selectMenu.addOptions(
          new StringSelectMenuOptionBuilder()
          .setValue('developer')
          .setLabel('Developer')
          .setEmoji('💻')
          .setDescription('Bewerbe dich als Developer')
        )
      }

      if(config.form.builder.active) {
        selectMenu.addOptions(
          new StringSelectMenuOptionBuilder()
          .setValue('builder')
          .setLabel('Builder')
          .setEmoji('🧱')
          .setDescription('Bewerbe dich als Builder')
        )
      }

      if(config.form["close-beta"].active) {
        selectMenu.addOptions(
          new StringSelectMenuOptionBuilder()
          .setValue('close-beta-tester')
          .setLabel('Close Beta Tester')
          .setEmoji('🎮')
          .setDescription('Bewerbe dich als Close Beta Tester')
        )
      }

      interaction.reply({
        ephemeral: true,
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>()
          .addComponents(selectMenu)
        ]
      }) 
    }

    if(interaction.isStringSelectMenu() && interaction.customId === 'formSelected') {

      const formProfile = await db.bewerbung.findFirst({ where: { userId: interaction.user.id}})
      const ticketProfile = await db.form.findFirst({ where: { userId: interaction.user.id}})

      if(formProfile || ticketProfile) return interaction.update({
        embeds: [
          new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription('<:rot:1250894634134147144> **Du hast bereits eine Bewerbung am laufen**')
        ],
        components: []
      })

      const type = interaction.values.toString()
      var type2: string = ""
      switch(type) {
        case 'developer': {
          type2 = 'Developer'
          break
        }
        case 'builder': {
          type2 = 'Builder'
          break
        }
        case 'close-beta-tester': {
          type2 = 'Close Beta Tester'
          break
        }
      } 

      await db.bewerbung.create({ data: { userId: interaction.user.id, type: type}})

      interaction.update({ 
        embeds: [
          new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription('<:grn:1250894631848120362> **Du hast erfolgreich eine Bewerbung gestartet weiter geht es in deinen Direktnachrichten**')
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
            .setCustomId('stopForm')
            .setLabel('Bewerbung abbrechen')
            .setStyle(ButtonStyle.Danger)
          )
        ],
      })

      interaction.user.send({
        embeds: [
          new EmbedBuilder()
          .setColor(Colors.Blue)
          .setDescription(`**Du hast eine Bewerbung als ${type2} gestartet. Schreibe "\`start\`" in den Chat um los zu legen!**`)
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
            .setCustomId('stopForm')
            .setLabel('Bewerbung abbrechen')
            .setStyle(ButtonStyle.Danger)
          )
        ],
      })
    }

    if(interaction.isButton() && interaction.customId === 'stopForm') {

      const formProfile = await db.bewerbung.findFirst({ where: { userId: interaction.user.id}})

      if(!formProfile) return interaction.update({
        embeds: [
          new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription('<:rot:1250894634134147144> **Diese Bewerbung ist bereits abgelaufen**')
        ],
        components: []
      })

      await db.bewerbung.deleteMany({ where: { userId: interaction.user.id}})

      interaction.update({
        embeds: [
          new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription('<:grn:1250894631848120362> **Du hast erfolgreich die Bewerbung abgebrochen**')
        ],
        components: []
      })
    }
  }
}