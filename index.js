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

// ===== TẠO BOT =====
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

// ===== LOGIN (AN TOÀN) =====
async function startBot() {
  try {
    if (!process.env.TOKEN) {
      throw new Error("❌ Không tìm thấy TOKEN!");
    }

    await client.login(process.env.TOKEN);
    console.log("✅ LOGIN SUCCESS");

  } catch (err) {
    console.error("❌ LOGIN FAIL:", err.message);
  }
}

// ===== WEB SERVER (RENDER) =====
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

app.listen(PORT, () => {
  console.log(`🌐 Web server chạy cổng ${PORT}`);
});

// ===== MESSAGE =====
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;

    const msg = message.content.toLowerCase().trim();
    console.log("📩 MSG:", msg);

    // ping
    if (msg === 'ping') {
      return message.reply('pong 🏓');
    }

    // meme
    if (msg.includes("alo vũ")) {
      return message.reply("Không anh ơi 😎");
    }

    // động lực
    if (msg.includes("chán học")) {
      return message.reply(`Alo Vũ à Vũ...
Không anh ơi 😔

💪 Cố lên bro!`);
    }

    // link
    if (msg.includes("delta vng")) {
      return message.reply(`Delta VNG:
https://www.mediafire.com/file/ipjryzyulpcul1v/Delta_Vng-2.714.1096_Up.apk/file`);
    }

    // video
    if (
      msg.includes("tiktok.com") ||
      msg.includes("youtube.com") ||
      msg.includes("youtu.be")
    ) {
      try {
        const res = await axios.get(
          `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(message.content)}`
        );

        const video = res.data?.video;

        if (!video) {
          return message.reply("❌ Không tải được video!");
        }

        return message.reply(`🎬 Video:\n${video}`);

      } catch {
        return message.reply("❌ API lỗi!");
      }
    }

    // menu
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
- CODEX VNG`,
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

// ===== ANTI CRASH =====
process.on('unhandledRejection', err => {
  console.error('❌ Unhandled Rejection:', err);
});
process.on('uncaughtException', err => {
  console.error('❌ Uncaught Exception:', err);
});

// ===== START BOT =====
startBot();
