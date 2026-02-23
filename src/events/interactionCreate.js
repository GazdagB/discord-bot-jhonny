import { updateMemberCount } from "../features/statsChannels.js";
import { postDailyNews } from "../features/dailyNews.js";
import { saveSubscriber, unsubscribeEmail } from "../db.js";
import dotenv from 'dotenv'
dotenv.config();

export async function interactionCreate(interaction) {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong! 🏓");
  }

  if (interaction.commandName === 'meeting'){
    console.log(interaction.user.id)

    const memberRoles = interaction.member.roles.cache;
    const hasRole = memberRoles.has(process.env.MANAGER_ROLE_ID)

    console.log(hasRole)

    if(!hasRole){
         await interaction.reply({ content: "❌ Meetinget csak a projektmenedzser hívhat össze.", ephemeral: true });
         return;
    }

    await interaction.reply({ content: '📬 Check your DMs!', ephemeral: true });

    const dmChannel = await interaction.user.createDM();

      // Helper function hogy ne kelljen ismételni az awaitMessages-t
  async function ask(question) {
    await dmChannel.send(question);
    const collected = await dmChannel.awaitMessages({
      filter: m => m.author.id === interaction.user.id,
      max: 1,
      time: 2 * 60 * 1000,
      errors: ['time'],
    });
    return collected.first().content;
  }

  try {
    const title = await ask('📋 Add meg a meeting címét:');
    const description = await ask('📝 Add meg a meeting leírását:');
    const date = await ask('📅 Add meg a meeting időpontját:');


    // Announcement csatornába posztolás
    const channel = await interaction.client.channels.fetch(process.env.ANNOUNCEMENTS_CHANNEL_ID);

    await channel.send({
      embeds: [{
        color: 0x5865F2,
        title: `📅 ${title}`,
        description: description,
        fields: [
          { name: '🕐 Időpont', value: date }
        ],
        footer: { text: `Meeting összehívta: ${interaction.user.username}` },
        timestamp: new Date(),
      }]
    });

    await dmChannel.send('✅ A meeting sikeresen ki lett hirdetve!');

  }  catch (error) {
    console.error('Meeting hiba:', error);
    
    if (error.message === 'time') {
      await dmChannel.send('⏰ Lejárt az idő! Próbáld újra a /meeting paranccsal.');
    } else {
      await dmChannel.send(`❌ Valami hiba történt: ${error.message}`);
    }
  }
  }

  if (interaction.commandName === 'unsubscribe') { 
    try {
       await unsubscribeEmail(interaction.user.id);
      interaction.reply({content: "✅ Sikeresen törlésre került az email címed az adatbázisból...", ephemeral: true })
    } catch (error) {
        interaction.reply({content: "❌ Váratlan hiba történt, keresd fel a projektmenedzsert....", ephemeral: true})
    }
  }

  if (interaction.commandName === "subscribe") {
    await interaction.reply({ content: "📬 Check your DMs!", ephemeral: true });

    const dmChannel = await interaction.user.createDM();
    await dmChannel.send(
      "Kérlek add meg az e-mail címedet amire az értesítéseket szeretnéd kapni a meetingekről!",
    );

    try {
      const collected = await dmChannel.awaitMessages({
        filter: (m) => {
          console.log("Message received:", m.content, "from:", m.author.id);
          console.log("Expected:", interaction.user.id);
          return m.author.id === interaction.user.id;
        },
        max: 1,
        time: 2 * 60 * 1000,
        errors: ["time"],
      });

      const email = collected.first().content;

      if (!email.includes("@")) {
        await dmChannel.send(
          "❌ Ez nem tűnik érvényes e-mail címnek. Próbáld újra a /subscribe paranccsal.",
        );
        return;
      }

      await saveSubscriber(interaction.user.id, email);
      await dmChannel.send(
        `✅ Sikeresen feliratkoztál ezzel az e-mail címmel: **${email}**!`,
      );
    } catch {
      await dmChannel.send(
        "⏰ Lejárt az idő! Próbáld újra a /subscribe paranccsal.",
      );
    }
  }


}
