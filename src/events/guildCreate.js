import { setupStatsChannels } from '../features/statsChannels.js';

export async function guildCreate(guild) {
  await guild.members.fetch();
  await setupStatsChannels(guild);
}