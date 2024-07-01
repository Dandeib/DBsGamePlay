import { db } from "$src/utils/db.js";
import { Colors, EmbedBuilder, GuildBan } from "discord.js";

export default {
  async execute(ban: GuildBan) {
    ban.user.send({
      embeds: [
        new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle('Du wurdest gebannt!')
        .setDescription(`Du wurdest vom \`${ban.guild.name}\` Discord Server gebannt\n\n> **Grund:** \`${ban.reason}\`\n> **Gebannt am:** \`${new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())}\`\n\nFalls du zu Unrecht gebannt wurdest oder ein entbannungs Antrag stellen möchstest kannst du uns über \`contact@dbsgameplay.de\` kontaktieren`)
      ]
    })

    const warnProfile = await db.warn.findFirst({ where: { userId: ban.user.id}})

    if(warnProfile) return await db.warn.updateMany({ where: { userId: ban.user.id}, data: { banne: { increment: 1}}})

    await db.warn.create({ data: { userId: ban.user.id, warns: [], banne: 1}})
  }
}