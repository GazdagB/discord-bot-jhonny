import { initDB } from '../db.js';
import { setupStatsChannels } from '../features/statsChannels.js';
import { registerSchedulers } from '../schedulers/index.js';

export async function ready(readyClient) {
  console.log(`✅ Logged in as ${readyClient.user.tag}!`);
  for (const guild of readyClient.guilds.cache.values()) {
    await guild.members.fetch();
    await setupStatsChannels(guild);
  }
  await initDB()
  console.log("Inited PostgreSQL Database")
  registerSchedulers(readyClient);
  console.log('📅 Daily news scheduled for 8:00 AM Budapest time');
}

