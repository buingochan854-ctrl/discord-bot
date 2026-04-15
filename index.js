require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
  console.log(`✅ Bot online: ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName('meme')
      .setDescription('Random meme vui'),

    new SlashCommandBuilder()
      .setName('taivideo')
      .setDescription('Tải video TikTok / YouTube')
      .addStringOption(option =>
        option.setName('link')
          .setDescription('Nhập link video')
          .setRequired(true)
      )
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Slash commands OK");
  } catch (err) {
    console.error(err);
  }
});

// Slash command
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // 😂 Meme
  if (interaction.commandName === 'meme') {
    try {
      const res = await axios.get("https://meme-api.com/gimme");
      return interaction.reply(res.data.url);
    } catch {
      return interaction.reply("❌ Lỗi meme!");
    }
  }

  // 🎬 Tải video
  if (interaction.commandName === 'taivideo') {
    const link = interaction.options.getString('link');

    await interaction.reply("⏳ Đang tải video...");

    try {
      const api = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(link)}`;
      const res = await axios.get(api);

      if (!res.data.video) {
        return interaction.editReply("❌ Không tải được video!");
      }

      return interaction.editReply(res.data.video);

    } catch (err) {
      console.error(err);
      return interaction.editReply("❌ Lỗi tải video!");
    }
  }
});

client.login(process.env.TOKEN)
  .then(() => console.log("👉 Đang login..."))
  .catch(err => console.error("❌ Login lỗi:", err));
