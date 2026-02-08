import dotenv from 'dotenv';
dotenv.config();
import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { getDailyTechNews } from './dailyNews.js';
import cron from 'node-cron';

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ] 
});

// Get Daily News Function
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
      // Greeting
      await channel.send('**Jóóóóóreggelt Srácok!** ☀️\n\nMai 4 TOP hír amit neked programozóként tudnod kell:');
      
      // Article #1 - Featured (detailed)
      const embed1 = new EmbedBuilder()
        .setColor('#FF4500')
        .setTitle(`🔥 ${articles[0].title}`)
        .setURL(articles[0].url)
        .setDescription(articles[0].content)
        .setFooter({ text: 'Kiemelt hír' })
        .setTimestamp();
      
      if (articles[0].imageUrl) {
        embed1.setImage(articles[0].imageUrl);
      }
      
      await channel.send({ embeds: [embed1] });
      
      // Article #2 - Summary
      const embed2 = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle(`💡 ${articles[1].title}`)
        .setURL(articles[1].url)
        .setDescription(articles[1].content)
        .setTimestamp();
      
      if (articles[1].imageUrl) {
        embed2.setImage(articles[1].imageUrl);
      }
      
      await channel.send({ embeds: [embed2] });
      
      // Article #3 - Summary
      const embed3 = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle(`⚡ ${articles[2].title}`)
        .setURL(articles[2].url)
        .setDescription(articles[2].content)
        .setTimestamp();
      
      if (articles[2].imageUrl) {
        embed3.setImage(articles[2].imageUrl);
      }
      
      await channel.send({ embeds: [embed3] });
      
      // Article #4 - Summary
      const embed4 = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle(`🚀 ${articles[3].title}`)
        .setURL(articles[3].url)
        .setDescription(articles[3].content)
        .setTimestamp();
      
      if (articles[3].imageUrl) {
        embed4.setImage(articles[3].imageUrl);
      }
      
      await channel.send({ embeds: [embed4] });
      
      // Sign-off
      await channel.send('**Jó kódolást!** 💻');
      
      console.log('✅ Daily news posted successfully!');
    } else {
      console.error('❌ Failed to generate news articles');
    }
  } catch (error) {
    console.error('❌ Error posting daily news:', error);
  }
}

client.on(Events.ClientReady, readyClient => {
  console.log(`✅ Logged in as ${readyClient.user.tag}!`);
  
  // Schedule daily news at 8:00 AM Budapest time
  // Cron format: minute hour * * *
  cron.schedule('0 8 * * *', () => {
    console.log('⏰ Triggering daily news at 8:00 AM Budapest time');
    postDailyNews();
  }, {
    timezone: "Europe/Budapest"
  });
  
  console.log('📅 Daily news scheduled for 8:00 AM Budapest time');
});

// Manual trigger for testing
client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === 'ping') {
    await message.reply('Pong! 🏓');
  }

  // Manual news trigger (for testing)
  if (message.content.toLowerCase() === '!news') {
    await message.reply('⏳ Napi TOP Hírek lekérdezése...');
    await postDailyNews();
  }
});

client.login(process.env.DISCORD_API_KEY);