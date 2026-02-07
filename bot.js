
import dotenv from 'dotenv';
dotenv.config();
import { Client, Events, GatewayIntentBits } from 'discord.js';


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

console.log('Token:', process.env.DISCORD_API_KEY ? 'Found' : 'NOT FOUND');
console.log('Token length:', process.env.DISCORD_API_KEY?.length);
client.login(process.env.DISCORD_API_KEY);

