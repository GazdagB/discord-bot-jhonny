import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong! 🏓'),
  new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription("Subscribes you to get notifications in email about our meetings!"),
  new SlashCommandBuilder()
  .setName('unsubscribe')
  .setDescription("Unsubscribes your email from the database! No more email's about meetings!"),
  new SlashCommandBuilder()
  .setName('meeting')
  .setDescription('The project manager can use this to announce a meeting.')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_API_KEY);

try {
  console.log('Registering slash commands...');
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log('✅ Slash commands registered!');
} catch (error) {
  console.error(error);
}