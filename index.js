const express = require('express');
const axios = require('axios');
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

// ===== WEB SERVER =====
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

app.listen(3000, () => {
  console.log('Web server chạy rồi');
});

// ===== DISCORD BOT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log('Bot online!');
});

// ===== FUNCTION DOWNLOAD VIDEO (PRO) =====
async function downloadVideo(url) {

  // API 1 (chính)
  try {
    const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
    if (res.data.video) {
      return res.data.video;
    }
  } catch {}

  // API 2 (fallback)
  try {
    const res = await axios.get(`https://api.savetube.me/download?url=${encodeURIComponent(url)}`);
    if (res.data.data && res.data.data.download) {
      return res.data.data.download;
    }
  } catch {}

  // API 3 (backup)
  try {
    const res = await axios.get(`https://api.ttdownloader.com/?url=${encodeURIComponent(url)}`);
    if (res.data.video) {
      return res.data.video;
    }
  } catch {}

  return null;
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase().trim();

  // ===== LỆNH =====
  if (msg === 'ping') return message.reply('pong 🏓');

  if (msg.includes("alo vũ")) return message.reply("Không anh ơi");

  // ===== AUTO VIDEO =====
  if (
    msg.includes("tiktok.com") ||
    msg.includes("youtube.com") ||
    msg.includes("youtu.be")
  ) {
    try {
      const video = await downloadVideo(message.content);

      if (!video) {
        return message.reply("❌ Không lấy được video (API có thể lỗi)");
      }

      return message.reply({
        content: "🎬 Video của bạn:",
        files: [video]
      });

    } catch (err) {
      console.log(err);
      return message.reply("❌ Lỗi tải video!");
    }
  }

  // ===== MENU =====
  if (msg === 'all client') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('select_os')
      .setPlaceholder('👉 Chọn hệ điều hành')
      .addOptions([
        { label: 'Android', value: 'android' },
        { label: 'iOS', value: 'ios' }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    return message.reply({
      content: '📦 Chọn hệ điều hành:',
      components: [row]
    });
  }

});

// ===== MENU SELECT =====
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  const choice = interaction.values[0];

  if (choice === 'android') {
    await interaction.reply({
      content: `ANDROID:
- DELTA VNG
- CODEX VNG
- ARCEUS`,
      ephemeral: true
    });
  }

  if (choice === 'ios') {
    await interaction.reply({
      content: `IOS:
- DELTA VNG`,
      ephemeral: true
    });
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
