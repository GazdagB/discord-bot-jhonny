import cron from 'node-cron';
import { postDailyNews } from '../features/dailyNews.js';
import { updateMemberCount } from '../features/statsChannels.js';


// This scheduled function posts the daily AI news ever day at 08:00 AM
export function registerSchedulers(client) {
  cron.schedule('0 8 * * *', () => postDailyNews(client), {
    timezone: 'Europe/Budapest'
  });

  // Updates the member count every time the clock hits 00 or 30 in minutes 
  cron.schedule('0,30 * * * *', async () => {
    for (const guild of client.guilds.cache.values()) {
      await updateMemberCount(guild);
    }
  });
}