import { updateMemberCount } from '../features/statsChannels.js';

export async function guildMemberAdd(member) {
  await updateMemberCount(member.guild);
}