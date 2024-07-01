import { ButtonInteraction, ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js";

export default {
  execute(interaction: ButtonInteraction) {
    if (interaction.customId === "verify") {
      //@ts-ignore
      interaction.member?.roles.add(
        interaction.guild?.roles.cache.get("1224436561131864064")
      );

      interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription("<:grn:1250894631848120362> Du hast erfolgreich die Regeln akzeptiert")
        ],
        ephemeral: true,
      });
    }
  },
};
