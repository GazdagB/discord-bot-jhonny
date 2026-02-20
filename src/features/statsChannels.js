import { ChannelType, PermissionFlagsBits } from 'discord.js';

const statsChannelIds = new Map();

export async function setupStatsChannels(guild) { 
// Check if we already have the category in this guild
  const existingCategory = guild.channels.cache.find(
    c => c.type === ChannelType.GuildCategory && c.name === '📊 Server Stats'
  );

  let category = existingCategory;

  if (!category) {
    category = await guild.channels.create({
      name: '📊 Server Stats',
      type: ChannelType.GuildCategory,
      position: 0,
    });
    console.log(`✅ Created "Server Stats" category in ${guild.name}`);
  }

  // Check if member count channel already exists under that category
  const existingMemberChannel = guild.channels.cache.find(
    c => c.parentId === category.id && c.type === ChannelType.GuildVoice
  );

  let memberChannel = existingMemberChannel;

  if (!memberChannel) {
    memberChannel = await guild.channels.create({
      name: `👥 Members: ${guild.memberCount}`,
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          // Everyone can see but NOT join — read-only voice
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.Connect],
          allow: [PermissionFlagsBits.ViewChannel],
        },
      ],
    });
    console.log(`✅ Created member count channel in ${guild.name}`);
  }

  statsChannelIds.set(guild.id, {
    categoryId: category.id,
    memberChannelId: memberChannel.id,
  });

  // Sync the count right away in case it's stale
  await updateMemberCount(guild);
}

export async function updateMemberCount(guild) { 
  const ids = statsChannelIds.get(guild.id);
  if (!ids) return;

  const channel = guild.channels.cache.get(ids.memberChannelId);
  if (!channel) return;

  const newName = `👥 Members: ${guild.memberCount}`;

  if (channel.name !== newName) {
    await channel.setName(newName).catch(err =>
      console.error('❌ Failed to update member count channel:', err)
    );
    console.log(`🔄 Updated member count to ${guild.memberCount} in ${guild.name}`);
  }
 }