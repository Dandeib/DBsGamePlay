import { db } from "$src/utils/db.js";
import { Colors, EmbedBuilder, StringSelectMenuInteraction } from "discord.js";

export default {
  async execute(interaction: StringSelectMenuInteraction) {
    if (interaction.customId === "clear-warn") {
      const values = interaction.values.toString();
      const choise = values.split(",");


      switch (choise[0]) {
        case "neuste": {

          const warnProfile = await db.warn.findFirst({ where: { userId: choise[1]}})
          

          if(!warnProfile || warnProfile.warns.length === 0) return interaction.update({
            embeds: [
              new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(
                  `<:rot:1250894634134147144>** Member nicht gefunden**`
                ),
            ],
            components: []
          });

          const warns = warnProfile.warns
          const warnung = warns.pop()
          

          await db.warn.updateMany({
            where: { userId: choise[1] },
            data: {
              warns: {
                set: warns 
              },
            },
          });

          await interaction.update({
            embeds: [
              new EmbedBuilder()
              .setColor(Colors.Green)
              .setDescription(`<:grn:1250894631848120362> **Dem Member <@${choise[1]}> wurde die neuste Warnung entfernt**\n\n> **Warnung:** \`${warnung}\``)
            ],
            components: []
          })

          break;
        }
        case 'alle': {
          const warnProfile = await db.warn.findFirst({ where: { userId: choise[1]}})
          

          if(!warnProfile || warnProfile.warns.length === 0) return interaction.update({
            embeds: [
              new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(
                  `<:rot:1250894634134147144>** Member nicht gefunden**`
                ),
            ],
            components: []
          });

          await db.warn.updateMany({
            where: { userId: choise[1] },
            data: {
              warns: {
                set: []
              },
            },
          });

          await interaction.update({
            embeds: [
              new EmbedBuilder()
              .setColor(Colors.Green)
              .setDescription(`<:grn:1250894631848120362> **Dem Member <@${choise[1]}> wurden alle Warnungen entfernt**`)
            ],
            components: []
          })

          break;
        }
        case 'count': {

          const warnProfile = await db.warn.findFirst({ where: { userId: choise[2]}})
          
          if(!warnProfile || warnProfile.warns.length === 0) return interaction.update({
            embeds: [
              new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(
                  `<:rot:1250894634134147144>** Member nicht gefunden**`
                ),
            ],
            components: []
          });

          const warns = warnProfile.warns
          const warnung = warns[parseInt(choise[1])-1]
          const updatedWarns = warns.filter(wort => wort !== warnung)        

          await db.warn.updateMany({
            where: { userId: choise[2] },
            data: {
              warns: {
                set: updatedWarns
              },
            },
          });

          await interaction.update({
            embeds: [
              new EmbedBuilder()
              .setColor(Colors.Green)
              .setDescription(`<:grn:1250894631848120362> **Dem Member <@${choise[2]}> wurde eine Warnung entfernt**\n\n> **Warnung:** \`${warnung}\``)
            ],
            components: []
          })
        }
      }
    }
  },
};
