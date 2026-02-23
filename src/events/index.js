import { Events } from 'discord.js';
import { ready } from './ready.js';
import { guildCreate } from './guildCreate.js';
import { guildMemberAdd } from './guildMemberAdd.js';
import { guildMemberRemove } from './guildMemberRemove.js';
import { messageCreate } from './messageCreate.js';
import { interactionCreate } from './interactionCreate.js';


export function registerEvents(client) {
  client.on(Events.ClientReady, ready);
  client.on(Events.GuildCreate, guildCreate);
  client.on(Events.GuildMemberAdd, guildMemberAdd);
  client.on(Events.GuildMemberRemove, guildMemberRemove);
  client.on(Events.MessageCreate, messageCreate);
  client.on(Events.InteractionCreate, interactionCreate);
}