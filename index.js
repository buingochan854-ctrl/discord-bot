const express = require('express');
const axios = require('axios');
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

// ===== ANTI CRASH =====
process.on('unhandledRejection', err => {
  console.error('❌ Unhandled Rejection:', err);
});
process.on('uncaughtException', err => {
  console.error('❌ Uncaught Exception:', err);
});

// ===== WEB SERVER =====
const app = express();
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(3000, () => console.log('🌐 Web server OK'));

// ===== DISCORD BOT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== READY =====
client.on('ready', () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
});

// ===== DOWNLOAD VIDEO =====
async function downloadVideo(url) {
  try {
    const res = await axios.get(
      `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`,
      { timeout: 7000 }
    );

    return res.data?.video || null;
  } catch (err) {
    console.log("API lỗi:", err.message);
    return null;
  }
}

// ===== MESSAGE =====
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;

    const msg = message.content.toLowerCase().trim();
    console.log("📩 MSG:", msg);

    // ===== LỆNH =====
    if (msg === 'ping') {
      return message.reply('pong 🏓');
    }

    if (msg.includes("alo vũ")) {
      return message.reply("Không anh ơi 😎");
    }

    if (msg.includes("chán học")) {
      return message.reply(`Alo Vũ à Vũ...
Không anh ơi 😔

Chán học à?

Thà để giọt mồ hôi rơi trên trang sách còn hơn là giọt nước mắt rơi trên đề thi.

"Học, học nữa, học mãi"

💪 Cố lên bro!`);
    }

    // ===== AUTO VIDEO =====
    if (
      msg.includes("tiktok.com") ||
      msg.includes("youtube.com") ||
      msg.includes("youtu.be")
    ) {
      const video = await downloadVideo(message.content);

      if (!video) {
        return message.reply("❌ Không tải được video!");
      }

      return message.reply(`🎬 Video:\n${video}`);
    }

    // ===== LINK DELTA =====
    if (msg.includes("delta vng")) {
      return message.reply(`Delta VNG:
https://www.mediafire.com/file/ipjryzyulpcul1v/Delta_Vng-2.714.1096_Up.apk/file`);
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

  } catch (err) {
    console.error('❌ Lỗi message:', err);
  }
});

// ===== INTERACTION =====
client.on('interactionCreate', async (interaction) => {
  try {
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

  } catch (err) {
    console.error('❌ Lỗi interaction:', err);
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN)
  .then(() => console.log("✅ LOGIN SUCCESS"))
  .catch(err => console.error("❌ LOGIN FAIL:", err));
