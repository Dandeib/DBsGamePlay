import { db } from "$src/utils/db.js";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Warne ein Member')
  .addUserOption(opt => opt.setName('user').setDescription('Der Member den du warnen willst').setRequired(true))
  .addStringOption(opt => opt.setName('grund').setDescription('Der Grund für den warn').setRequired(true))

async function execute(interaction:ChatInputCommandInteraction) {
   
  const user = interaction.options.getMember('user') as GuildMember
  const reason = interaction.options.getString('grund')

  //@ts-ignore
  if(interaction.member?.roles.highest.position <= user.roles.highest.position ) {
            
    interaction.reply({embeds: [
      new EmbedBuilder()
      .setColor(Colors.Red)
      .setDescription(`<:rot:1250894634134147144> ** Dieser User kann nicht gewarnt werden da er eine höhere oder gleiche rolle hat wie du!**`)
    ]})

  }else {

    interaction.reply({embeds: [
      new EmbedBuilder()
      .setColor(Colors.Green)
      .setDescription(`<:grn:1250894631848120362> **Der Member <@${user.id}> wurde gewarnt**\n\n> **Grund:** \`${reason}\``)
    ]})
    
    const warnProfile = await db.warn.findFirst({ where: { userId: user.id}})

    if(warnProfile) {
      await db.warn.updateMany({ where: { userId: user.id}, data: { warns: { push: reason as string}}})
    }
    else {
      await db.warn.create({ data: { userId: user.id, warns: [reason as string]} })
    }

  }
}

export { data, execute }