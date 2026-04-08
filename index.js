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

// ===== GAME =====
let lastWord = null;
let gameOn = false;

// ===== CHECK TỪ ĐIỂN =====
async function checkWord(word) {
  try {
    const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    return res.data && res.data.length > 0;
  } catch {
    return false;
  }
}

// fallback tiếng Việt
function isVietnameseValid(text) {
  return /^[a-zA-ZÀ-ỹ\s]+$/.test(text);
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase().trim();

  // ===== START / STOP =====
  if (msg === 'start noitu') {
    gameOn = true;
    lastWord = null;
    return message.reply('🎮 Bắt đầu nối từ!');
  }

  if (msg === 'dừng game') {
    gameOn = false;
    lastWord = null;
    return message.reply('🛑 Đã dừng game!');
  }

  // ===== GAME =====
  if (gameOn) {

    const words = msg.split(" ");
    if (words.length < 2) return;

    const first = words[0];
    const last = words[words.length - 1];

    // check từ cuối có nghĩa không
    let isValid = false;

    if (/^[a-z]+$/.test(last)) {
      // tiếng Anh → check API
      isValid = await checkWord(last);
    } else {
      // tiếng Việt → check cơ bản
      isValid = isVietnameseValid(last);
    }

    if (!isValid) {
      return message.reply("❌ Từ không có nghĩa!");
    }

    if (!lastWord) {
      lastWord = last;
      return message.reply(`🎯 Bắt đầu!
Từ tiếp theo: **${lastWord}**`);
    }

    if (first !== lastWord) {
      return message.reply(`❌ Sai!
Phải bắt đầu bằng: **${lastWord}**`);
    }

    lastWord = last;
    return message.reply(`✅ Đúng! Tiếp: **${lastWord}**`);
  }

  // ===== LỆNH KHÁC =====
  if (msg === 'ping') {
    return message.reply('pong 🏓');
  }

  if (msg.includes("alo vũ")) {
    return message.reply("Không anh ơi");
  }

  if (msg.includes("delta vng ios")) {
    return message.reply(`Delta VNG iOS:
https://www.mediafire.com/file/afmig367b9v2hr5/DeltaVN+V57+HuyMythic.ipa/file`);
  }

  if (msg.includes("delta vng")) {
    return message.reply(`Delta VNG:
https://www.mediafire.com/file/ipjryzyulpcul1v/Delta_Vng-2.714.1096_Up.apk/file`);
  }

  if (msg.includes("codex vng")) {
    return message.reply(`CODEX VNG:
https://www.mediafire.com/file/i43otfr7w6ukcod/Codex.apk/file`);
  }

  if (msg.includes("arceus neo vng")) {
    return message.reply(`ARCEUS NEO:
https://www.mediafire.com/file/i5g2c4tasweprps/Arceus.apk/file`);
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

// ===== MENU =====
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  const choice = interaction.values[0];

  if (choice === 'android') {
    await interaction.reply({
      content: `ANDROID:
- DELTA
- CODEX
- ARCEUS`,
      ephemeral: true
    });
  }

  if (choice === 'ios') {
    await interaction.reply({
      content: `IOS:
- DELTA`,
      ephemeral: true
    });
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
