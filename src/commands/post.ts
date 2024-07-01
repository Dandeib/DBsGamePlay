import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

const data = new SlashCommandBuilder()
  .setName("post")
  .setDescription("Sende ein Modul")
  // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((opt) =>
    opt
      .setName("module")
      .setDescription("Wähle ein Modul aus")
      .setChoices(
        { name: "rules", value: "rules" },
        { name: "ticket", value: "ticket" },
        { name: "bewerbung", value: "bewerbung" },
        { name: "unban", value: "unban" }
      )
      .setRequired(true)
  );
// .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

async function execute(interaction: ChatInputCommandInteraction) {
  const choise = interaction.options.getString("module");

  switch (choise) {
    case "rules": {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Regeln für DBsGamePlay")
            .setDescription(
              "**1. Allgemein:**\n> :small_blue_diamond: Einheitliche Namensgebung ist erwünscht, vermeide Namen, die Gewalt, Rechtsextremismus oder Beleidigungen verherrlichen.\n> :small_blue_diamond: Ausgeben als Teammitglied oder Person des öffentlichen Lebens ist untersagt.\n> :small_blue_diamond: Respektiere die Entscheidungen der Moderation, und das Betteln nach Berechtigungen ist nicht erlaubt\n> :small_blue_diamond: Täusche keine Ränge vor, um einen Vorteil zu erlangen, und respektiere den vollen Bewerbungsprozess für Teammitglieder.\n> :small_blue_diamond: Keine Werbung für andere Server und weiteres.\n\n**2. Discord:**\n> :small_blue_diamond: Erlaubte Sonderzeichen und Emojis im Namen, solange sie nicht gegen das Regelwerk verstoßen.\n> :small_blue_diamond: Vermeide unangebrachte Avatare und störe keine Gespräche absichtlich\n> :small_blue_diamond: Im Sprachkanal bitte nur Sinnvolles beitragen, bei unnötigen oder unangebrachten Geräuschen kann man getimoutet werden.\n> :small_blue_diamond: Musikbots sind nur in privaten Kanälen erlaubt, und das Channel-Hopping sowie das Aufnehmen von Gesprächen sind untersagt.\n> :small_blue_diamond: Keine Nutzung von Proxys oder Echtgeldhandel, und respektiere die Privatsphäre anderer Mitglieder.\n> :small_blue_diamond: Teammitglieder haben ein volles Weisungsrecht.\n> :small_blue_diamond: Eigenwerbung ist komplett verboten und wird mit einem Ban bestraft.\n\n**3. Minecraft:**\n> :small_blue_diamond: Es erfolgt keine Erstattung bei Verlust von Items, und unterlasse falsche Gebote.\n> :small_blue_diamond: Erlaubte Modifikationen und Clients sind beispielsweise Lunar Client, Badlion Client oder Labymod, während Betrügen, Zerstören von Grundstücken und AFK-Farming untersagt sind.\n> :small_blue_diamond: Ressource Packs, mit denen man keinen spielerischen Vorteil erhält, sind erlaubt.\n> :small_blue_diamond: TPA-Fallen sind verboten.\n> :small_blue_diamond: Chatverhalten sollte angemessen sein, ohne Spam, Großbuchstaben oder übermäßige Farb-Codes."
            ),
        ],
        components: [
          //@ts-ignore
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("verify")
              .setEmoji("✅")
              .setLabel("Regeln Akzeptieren")
              .setStyle(ButtonStyle.Success)
          ),
        ],
      });
      break;
    }
    case "ticket": {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Ticket Support")
            .setDescription(
              "Klicke auf den Button unter dieser Nachricht um ein Ticket zu öffnen"
            )
            .setColor(Colors.Green),
        ],
        components: [
          //@ts-ignore
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("openTicket")
              .setEmoji("🎫")
              .setLabel("Ticket öffnen")
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      });
      break;
    }
    case "bewerbung": {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Bewerbungs Ticket")
            .setDescription(
              "Klicke auf den Button unter dieser Nachricht um die Bewerbung zu starten"
            )
            .setColor(Colors.Blue),
        ],
        components: [
          //@ts-ignore
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("formSelect")
              .setEmoji("🎫")
              .setLabel("Bewerbung starten")
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      });
      break;
    }
    case "unban": {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Entbannungs-Antrag stellen")
            .setDescription(
              "Klicke auf den Button unter dieser Nachricht um ein Entbannungs Antrag zu stellen"
            )
            .setColor(Colors.Red),
        ],
        components: [
          //@ts-ignore
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("openunbanTicket")
              .setEmoji("🎫")
              .setLabel("Entbannungs Antrag stellen")
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      });
      break;
    }
  }
}

export { data, execute };
