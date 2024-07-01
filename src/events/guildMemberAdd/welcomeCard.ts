import { createCanvas, loadImage, registerFont } from "canvas";
import { AttachmentBuilder, ChatInputCommandInteraction, Client, SlashCommandBuilder, GuildMember, GuildChannel, Channel, BaseGuildTextChannel } from "discord.js"; 

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

registerFont(path.join(__dirname, '..', '..', 'utils', 'arialroundedmtbold.ttf'), {family: 'Arial Rounded MT Bold', weight: 'bold'} )

export default {
  async execute(member: GuildMember) {
    
    const canvas = createCanvas(700, 200)
    const ctx = canvas.getContext("2d")

    const background = await loadImage('http://img.dandeib.de/dbgameplaywelcomecard.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '45px "Arial Rounded MT Bold"';
    ctx.textAlign = 'center';
    ctx.fillText(member.user.username as string, 435 , 80);

    const avatarSize = 128;
    const avatarX = 41;
    const avatarY = 34;
    const avatarRadius = avatarSize / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    //@ts-ignore
    const avatarImage = await loadImage(member.displayAvatarURL({ extension: 'jpg', size: avatarSize }));
    ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);

    //@ts-ignore
    const attachment = new AttachmentBuilder(canvas.toBuffer(), 'willkommen.png');
    const channel = await member.guild.channels.fetch('1197978577262612611') as BaseGuildTextChannel
    channel.send({ files: [attachment] });
  }
}