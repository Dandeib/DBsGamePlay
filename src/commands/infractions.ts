import { db } from "$src/utils/db.js";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName('infractions')
  .setDescription('Zeige alle warns eines Members an')
  .addUserOption(opt => opt.setName('user').setDescription('Der Member dessen warns du sehen willst').setRequired(true))

async function execute(interaction:ChatInputCommandInteraction) {
   
  const user = interaction.options.getMember('user') as GuildMember

  const warnProfile = await db.warn.findFirst({ where: { userId: user.id}})

  if(!warnProfile || warnProfile.warns.length === 0) return interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setColor(Colors.Red)
      .setDescription(`<:rot:1250894634134147144>** Dieser Member hat keine Warnungen**`)
  ]})

  let field = ``
  let warns=1

  for (const warn of warnProfile.warns) {
    field += `> **${warns}:** \`${warn}\`\n`
    warns ++
  }

  const embed = new EmbedBuilder()
  .setColor(Colors.Green)
  .setDescription(`<:grn:1250894631848120362> **Der Member <@${user.id}> hat \`${warnProfile.warns.length}\` Warnungen**\n\n**Infractions:**\n\n${field}\n\n**Timeouts:** \`${warnProfile.timeout}\`\n**Banne:** \`${warnProfile.banne}\``)

  await interaction.reply({embeds: [ embed ]})
}

export { data, execute }