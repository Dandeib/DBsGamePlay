import { db } from "$src/utils/db.js";
import {
  ActionRowBuilder,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

const data = new SlashCommandBuilder()
  .setName("remove-warns")
  .setDescription("Entferne die Warnungen eines Members")
  .addUserOption((opt) =>
    opt
      .setName("user")
      .setDescription("Der Member dessen warnungen du entfernen willst")
      .setRequired(true)
  );

async function execute(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getMember("user") as GuildMember;

  //@ts-ignore
  if (interaction.member?.roles.highest.position <= user.roles.highest.position) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription(
            `<:rot:1250894634134147144> **<:rot:1250894634134147144> Du hast nicht die nötigen berechtigungen dafür!**`
          ),
      ],
    });
  } else {
    const warnProfile = await db.warn.findFirst({ where: { userId: user.id } });

    if (!warnProfile || warnProfile.warns.length === 0)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(
              `<:rot:1250894634134147144>**<:rot:1250894634134147144> Dieser Member hat keine Warnungen!**`
            ),
        ],
      });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("clear-warn")
      .setPlaceholder(
        "Wähle die Warnung aus die du entfernen willst"
      )
      .setOptions(
        new StringSelectMenuOptionBuilder()
          .setValue(`neuste,${user.id}`)
          .setLabel("Neuste Warnung entfernen")
          .setEmoji("🆕"),
        new StringSelectMenuOptionBuilder()
          .setValue(`alle,${user.id}`)
          .setLabel("Alle Warnungen entfernen")
          .setEmoji("🛡️")
      );

    let count = 1;

    for (const warn of warnProfile.warns) {
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setValue(`count,${count.toString()},${user.id}`)
          .setLabel(`${count.toString()}. Warnung`)
          .setDescription(warn)
          .setEmoji("📍")
      );
      count++;
    }

    interaction.reply({
      components: [
        //@ts-ignore
        new ActionRowBuilder().addComponents(selectMenu),
      ],
      ephemeral: true,
    });
  }
}

export { data, execute };
