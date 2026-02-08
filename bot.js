import dotenv from 'dotenv';
dotenv.config();
import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { getDailyTechNews } from './dailyNews.js';

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ] 
});

client.on(Events.ClientReady, readyClient => {
  console.log(`✅ Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === 'ping') {
    await message.reply('Pong! 🏓');
  }

  if (message.content.toLowerCase() === '!news') {
    await message.reply('⏳ Napi TOP Hírek lekérdezése...');
    
    try {
      const articles = await getDailyTechNews();

      if (articles && articles.length === 4) {
        // Greeting
        await message.channel.send('**Jóóóóóreggelt Srácok!** ☀️\n\nMai 4 TOP hír amit neked programozóként tudnod kell:');
        
        // Article #1 - Featured (detailed)
        const embed1 = new EmbedBuilder()
          .setColor('#FF4500')
          .setTitle(`🔥 ${articles[0].title}`)
          .setURL(articles[0].url) // 
          .setDescription(articles[0].content)
          .setFooter({ text: 'Kiemelt hír' })
          .setTimestamp();
        
        if (articles[0].imageUrl) {
          embed1.setImage(articles[0].imageUrl);
        }
        
        await message.channel.send({ embeds: [embed1] });
        
        // Article #2 - Summary
        const embed2 = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle(`💡 ${articles[1].title}`)
          .setURL(articles[1].url) // Makes title clickable
          .setDescription(articles[1].content)
          .setTimestamp();
        
        if (articles[1].imageUrl) {
          embed2.setImage(articles[1].imageUrl);
        }
        
        await message.channel.send({ embeds: [embed2] });
        
        // Article #3 - Summary
        const embed3 = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle(`⚡ ${articles[2].title}`)
          .setURL(articles[2].url) // Makes title clickable
          .setDescription(articles[2].content)
          .setTimestamp();
        
        if (articles[2].imageUrl) {
          embed3.setImage(articles[2].imageUrl);
        }
        
        await message.channel.send({ embeds: [embed3] });
        
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
        
        await message.channel.send({ embeds: [embed4] });
        
        // Sign-off
        await message.channel.send('**Jó kódolást!** 💻');
        
      } else {
        await message.reply('❌ Nem sikerült lekérdezni a híreket.');
      }
    } catch (error) {
      console.error('Error:', error);
      await message.reply('❌ Hiba történt: ' + error.message);
    }
  }
});

client.login(process.env.DISCORD_API_KEY);