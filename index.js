const express = require('express');
const axios = require('axios');
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

// ===== DEBUG TOKEN =====
console.log("CHECK TOKEN:", process.env.TOKEN ? "CÓ TOKEN" : "KHÔNG CÓ TOKEN");

// ===== ANTI CRASH =====
process.on('unhandledRejection', err => {
  console.error('❌ Unhandled Rejection:', err);
});
process.on('uncaughtException', err => {
  console.error('❌ Uncaught Exception:', err);
});

// ===== WEB SERVER (FIX PORT RENDER) =====
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🌐 Web server chạy cổng ${PORT}`);
});

// ===== DISCORD BOT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== READY =====
client.once('ready', () => {
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

💪 Cố lên bro!`);
    }

    if (msg.includes("delta vng")) {
      return message.reply(`Delta VNG:
https://www.mediafire.com/file/ipjryzyulpcul1v/Delta_Vng-2.714.1096_Up.apk/file`);
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
  .catch(err => console.error("❌ LOGIN FAIL:", err.message));
