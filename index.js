require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

// ===== CHECK TOKEN =====
if (!process.env.TOKEN) {
  console.log("❌ Không có TOKEN!");
  process.exit(1);
}

// ===== BOT =====
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

  const msg = message.content.toLowerCase();

  if (msg === 'ping') return message.reply('pong 🏓');

  if (msg.includes("alo vũ")) return message.reply("Không anh ơi 😎");

  if (msg.includes("chán học")) return message.reply("💪 Cố lên bro!");

  if (msg.includes("delta vng")) {
    return message.reply("https://www.mediafire.com/file/ipjryzyulpcul1v/Delta_Vng-2.714.1096_Up.apk/file");
  }

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
    await interaction.reply({ content: "ANDROID:\n- DELTA VNG\n- CODEX VNG", ephemeral: true });
  }

  if (choice === 'ios') {
    await interaction.reply({ content: "IOS:\n- DELTA VNG", ephemeral: true });
  }
});

// ===== WEB =====
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is alive!'));

app.listen(PORT, () => {
  console.log(`🌐 Web server chạy cổng ${PORT}`);
});

// ===== LOGIN =====
console.log("👉 Đang login...");
client.login(process.env.TOKEN)
  .then(() => console.log("✅ LOGIN SUCCESS"))
  .catch(err => console.error("❌ LOGIN FAIL:", err.message));
