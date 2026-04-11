const express = require('express');
const axios = require('axios');
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

// ===== CHECK TOKEN =====
if (!process.env.TOKEN) {
  console.error("❌ Thiếu TOKEN trong Render ENV!");
  process.exit(1);
}

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

// ===== MESSAGE =====
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase().trim();

  // test
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
});

// ===== INTERACTION =====
client.on('interactionCreate', async (interaction) => {
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
});

// ===== WEB SERVER (RENDER) =====
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

app.listen(PORT, () => {
  console.log(`🌐 Web server chạy cổng ${PORT}`);
});

// ===== LOGIN (FIX CỨNG) =====
(async () => {
  try {
    console.log("👉 Đang login...");

    await client.login(process.env.TOKEN);

    console.log("✅ LOGIN SUCCESS");
  } catch (err) {
    console.error("❌ LOGIN FAIL:", err);
  }
})();

// ===== ANTI CRASH =====
process.on('unhandledRejection', err => console.error("❌ Lỗi:", err));
process.on('uncaughtException', err => console.error("❌ Lỗi:", err));
