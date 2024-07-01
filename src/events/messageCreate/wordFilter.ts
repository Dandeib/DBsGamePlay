import { db } from "$src/utils/db.js";
import { ChannelType, Colors, EmbedBuilder, Message } from "discord.js";

const filter = await db.filter.findUnique({
  where: { id: "666b4dd41e86e04641cf6bff" },
});

export default {
  async execute(message: Message) {

    if(message.channel.type === ChannelType.DM) return
    const lowerCaseMessage = message.content.toLowerCase();
    if (filter?.words.some((wort) => lowerCaseMessage.includes(wort))) {
      
      try {
        message.delete()

        message.channel.send({ embeds: [
          new EmbedBuilder()
          .setDescription(`<:grn:1250894631848120362> **Der Member <@${message.author.id}> wurde gewarnt**\n\n> **Grund:** \`Beleidigung\`\n> **Nachricht:** \`${message.content}\``)
          .setColor(Colors.Green)
        ]})
      }
      catch(e) {
        console.log(e)
      }
      
    }
  },
};
