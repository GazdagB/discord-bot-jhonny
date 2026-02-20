import { updateMemberCount } from '../features/statsChannels.js';

export async function guildMemberRemove(member) {
  await updateMemberCount(member.guild);
}