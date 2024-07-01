import { db } from "$src/utils/db.js";
import { ActionRowBuilder, BaseGuildTextChannel, ButtonBuilder, ButtonStyle, ChannelType, Client, Colors, EmbedBuilder, Message, ThreadChannel } from "discord.js";
import config from '../../config.json'

export default {
  async execute(message: Message, client: Client) {

    if(message.channel.type === ChannelType.DM) {

      if(message.content === 'start') {
        const formProfile = await db.bewerbung.findFirst({ where: { userId: message.author.id}})

        if(!formProfile) return
        
        var fragen: Array<string> = []
        if(formProfile.type === 'developer') fragen = config.form.dev.fragen
        if(formProfile.type === 'builder') fragen = config.form.builder.fragen
        if(formProfile.type === 'close-beta-tester') fragen = config.form["close-beta"].fragen
        var type: string;
        switch(formProfile.type) {
          case 'developer': {
            type = 'Developer'
            break
          }
          case 'builder': {
            type = 'Builder'
            break
          }
          case 'close-beta-tester': {
            type = 'Close Beta Tester'
            break
          }
        }
        if(fragen.length === 0) return
        var answers: Array<string> = []
        let index = 0
        
        askQuestion()

        const collector = message.channel.createMessageCollector({
          filter: (m) => m.author.id === message.author.id,
          max: fragen.length,
        });

        collector.on('collect', async (msg) => {
          answers.push(msg.content)
          await askQuestion()
        });
        
        async function askQuestion() {
          if (index < fragen!.length) {
            message.author.send({
              embeds: [
                new EmbedBuilder()
                .setColor(Colors.Blue)
                .setDescription(`**${fragen[index]}**`)
              ]
            });
            index++;
          } else {
            await db.bewerbung.deleteMany({ where: { userId: message.author.id}})

            const guild = await client.guilds.fetch('222222548442546176')
            const channel = await guild.channels.fetch(config.bewerbung.threadTicketChannelId) as BaseGuildTextChannel
            const thread: ThreadChannel = await channel.threads.create({
              name: `bewerbung-${message.author.username}`,
              type: ChannelType.PrivateThread
            })
  
            thread.members.add(message.author.id)

            thread.send({
              embeds: [
                new EmbedBuilder()
                .setTitle(`Hallo ${message.author.username},`)
                .setDescription('unser Team wird sich in laufe der Tage bei dir hier melden')
                .setColor(Colors.Blue)
              ],
              components: [
                //@ts-ignore
                new ActionRowBuilder()
                .addComponents(
                  new ButtonBuilder()
                  .setCustomId('closeBewerbung')
                  .setEmoji('🗑')
                  .setLabel('Schließen')
                  .setStyle(ButtonStyle.Danger)
                )
              ]
            })

            let bewerbung = ``;

            for (let i = 0; i < fragen.length; i++) {
              bewerbung += `**${fragen[i]}**\n> ${answers[i]}\n\n`;
            }


            thread.send({
              embeds: [
                new EmbedBuilder()
                .setTitle('Bewerbung')
                .setColor(Colors.Blue)
                .setDescription(bewerbung)
              ]
            })


            const joinchannel = await guild.channels.fetch(config.bewerbung.joinMessageChannelId)
            //@ts-ignore
            const joinMessage = await joinchannel?.send({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`${type} Bewerbung ${message.author.username}`)
                    .setDescription('Eine Bewerbung wurde eingereicht klicke auf den Button unter dieser Nachricht um dem Ticket zu joinen')
                    .setColor(Colors.Blue)
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('joinBewerbung')
                        .setLabel('Join')
                        .setEmoji('➕')
                        .setStyle(ButtonStyle.Success)
                    )
                ]
            })
    
            await db.form.create({ data: { userId: message.author.id, ticketId: thread.id, joinId: joinMessage.id}})

            message.author.send({ embeds: [
              new EmbedBuilder()
              .setColor(Colors.Green)
              .setDescription(`<:grn:1250894631848120362> **Du hast es geschafft! Es wurde ein Bewerbungs Ticket für dich erstellt** | <#${thread.id}>`)
            ]})
          }
        }
      }
      
    }
  }
}