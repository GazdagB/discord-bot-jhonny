import { updateMemberCount } from '../features/statsChannels.js';
import { postDailyNews } from '../features/dailyNews.js';

export async function messageCreate(message) {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === 'ping') {
    await message.reply('Pong! 🏓');
  }

  if (message.content.toLowerCase() === '!news') {
    await message.reply('⏳ Napi TOP Hírek lekérdezése...');
    await postDailyNews(message.client);
  }

  if (message.content.toLowerCase() === '!stats') {
    await message.guild.members.fetch();
    await updateMemberCount(message.guild);
    await message.reply('✅ Stats csatornák frissítve!');
  }
}