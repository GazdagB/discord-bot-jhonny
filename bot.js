import dotenv from 'dotenv';
dotenv.config();
import { Client, Events, GatewayIntentBits, EmbedBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { getDailyTechNews } from './dailyNews.js';
import cron from 'node-cron';

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ] 
});

// ─────────────────────────────────────────
// STATS CHANNELS SETUP
// ─────────────────────────────────────────

// Stores ChannelID on start 
const statsChannelIds = new Map(); 

async function setupStatsChannels(guild) {
  // Check if we already have the category in this guild
  const existingCategory = guild.channels.cache.find(
    c => c.type === ChannelType.GuildCategory && c.name === '📊 Server Stats'
  );

  let category = existingCategory;

  if (!category) {
    category = await guild.channels.create({
      name: '📊 Server Stats',
      type: ChannelType.GuildCategory,
      position: 0,
    });
    console.log(`✅ Created "Server Stats" category in ${guild.name}`);
  }

  // Check if member count channel already exists under that category
  const existingMemberChannel = guild.channels.cache.find(
    c => c.parentId === category.id && c.type === ChannelType.GuildVoice
  );

  let memberChannel = existingMemberChannel;

  if (!memberChannel) {
    memberChannel = await guild.channels.create({
      name: `👥 Members: ${guild.memberCount}`,
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          // Everyone can see but NOT join — read-only voice
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.Connect],
          allow: [PermissionFlagsBits.ViewChannel],
        },
      ],
    });
    console.log(`✅ Created member count channel in ${guild.name}`);
  }

  statsChannelIds.set(guild.id, {
    categoryId: category.id,
    memberChannelId: memberChannel.id,
  });

  // Sync the count right away in case it's stale
  await updateMemberCount(guild);
}

async function updateMemberCount(guild) {
  const ids = statsChannelIds.get(guild.id);
  if (!ids) return;

  const channel = guild.channels.cache.get(ids.memberChannelId);
  if (!channel) return;

  const newName = `👥 Members: ${guild.memberCount}`;

  // Discord rate-limits channel renames to 2 per 10 min — only update if changed
  if (channel.name !== newName) {
    await channel.setName(newName).catch(err =>
      console.error('❌ Failed to update member count channel:', err)
    );
    console.log(`🔄 Updated member count to ${guild.memberCount} in ${guild.name}`);
  }
}

// ─────────────────────────────────────────
// GET DAILY NEWS FUNCTION
// ─────────────────────────────────────────

async function postDailyNews() {
  console.log('📰 Running daily news task...');
  
  const channel = client.channels.cache.get(process.env.NEWS_CHANNEL_ID);
  
  if (!channel) {
    console.error('❌ News channel not found!');
    return;
  }

  try {
    const articles = await getDailyTechNews();

    if (articles && articles.length === 4) {
      await channel.send('**Jóóóóóreggelt Srácok!** ☀️\n\nMai 4 TOP hír amit neked programozóként tudnod kell:');
      
      const colors = ['#FF4500', '#0099FF', '#0099FF', '#0099FF'];
      const icons  = ['🔥', '💡', '⚡', '🚀'];
      const footer = ['Kiemelt hír', null, null, null];

      for (let i = 0; i < 4; i++) {
        const embed = new EmbedBuilder()
          .setColor(colors[i])
          .setTitle(`${icons[i]} ${articles[i].title}`)
          .setURL(articles[i].url)
          .setDescription(articles[i].content)
          .setTimestamp();

        if (footer[i]) embed.setFooter({ text: footer[i] });
        if (articles[i].imageUrl) embed.setImage(articles[i].imageUrl);

        await channel.send({ embeds: [embed] });
      }
      
      await channel.send('**Jó kódolást!** 💻');
      console.log('✅ Daily news posted successfully!');
    } else {
      console.error('❌ Failed to generate news articles');
    }
  } catch (error) {
    console.error('❌ Error posting daily news:', error);
  }
}

// ─────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────

client.on(Events.ClientReady, async readyClient => {
  console.log(`✅ Logged in as ${readyClient.user.tag}!`);

  // Setup stats channels for every guild the bot is in
  for (const guild of readyClient.guilds.cache.values()) {
    // Fetch all members so memberCount is accurate
    await guild.members.fetch();
    await setupStatsChannels(guild);
  }

  // Schedule daily news at 8:00 AM Budapest time
  cron.schedule('0 8 * * *', () => {
    console.log('⏰ Triggering daily news at 8:00 AM Budapest time');
    postDailyNews();
  }, { timezone: 'Europe/Budapest' });

  console.log('📅 Daily news scheduled for 8:00 AM Budapest time');
});

client.on(Events.GuildCreate, async guild => {
  await guild.members.fetch();
  await setupStatsChannels(guild);
});

// Member joins → update count
client.on(Events.GuildMemberAdd, async member => {
  await updateMemberCount(member.guild);
});

// Member leaves → update count
client.on(Events.GuildMemberRemove, async member => {
  await updateMemberCount(member.guild);
});

// Schedule a count refresh every 30 minutes with a crone job
cron.schedule('0,30 * * * *', async () => {
  for (const guild of client.guilds.cache.values()) {
    await updateMemberCount(guild);
  }
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === 'ping') {
    await message.reply('Pong! 🏓');
  }

  if (message.content.toLowerCase() === '!news') {
    await message.reply('⏳ Napi TOP Hírek lekérdezése...');
    await postDailyNews();
  }

  // Manual stat refresh in case something desyncs
  if (message.content.toLowerCase() === '!stats') {
    await message.guild.members.fetch();
    await updateMemberCount(message.guild);
    await message.reply('✅ Stats csatornák frissítve!');
  }
});



client.login(process.env.DISCORD_API_KEY);