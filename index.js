const express = require('express');
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

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase().trim();

  // ===== LỆNH CƠ BẢN =====
  if (msg === 'ping') {
    return message.reply('pong 🏓');
  }

  if (msg.includes("alo vũ")) {
    return message.reply("Không anh ơi");
  }

  if (msg.includes("chán học")) {
    return message.reply(`Alo Vũ à Vũ...
Không anh ơi 😔

Chán học à?

Thà để giọt mồ hôi rơi trên trang sách còn hơn là giọt nước mắt rơi trên đề thi.

"Học, học nữa, học mãi" - V.I. Lenin

💪 Nỗ lực hôm nay = thành công ngày mai!`);
  }

  // ===== LINK CLIENT =====

  // Delta iOS
  if (msg.includes("delta vng ios")) {
    return message.reply(`Delta VNG iOS:
https://www.mediafire.com/file/afmig367b9v2hr5/DeltaVN+V57+HuyMythic.ipa/file`);
  }

  // Delta Android
  if (msg.includes("delta vng")) {
    return message.reply(`Delta VNG:
https://www.mediafire.com/file/ipjryzyulpcul1v/Delta_Vng-2.714.1096_Up.apk/file`);
  }

  // CodeX
  if (msg.includes("codex vng")) {
    return message.reply(`CODEX VNG V2.711 BY **NAKNOHACK**
https://www.mediafire.com/file/i43otfr7w6ukcod/Codex.apk/file`);
  }

  // Arceus Neo
  if (msg.includes("arceus neo vng")) {
    return message.reply(`ARCEUS NEO VNG V2.711 BY **NAKNOHACK**
https://www.mediafire.com/file/i5g2c4tasweprps/Arceus.apk/file`);
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
      content: '📦 Chọn hệ điều hành bạn muốn:',
      components: [row]
    });
  }

});

// ===== XỬ LÝ MENU =====
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  const choice = interaction.values[0];

  if (choice === 'android') {
    await interaction.reply({
      content: `**CLIENT ANDROID**
- DELTA VNG
- CODEX VNG
- ARCEUS NEO VNG`,
      ephemeral: true
    });
  }

  if (choice === 'ios') {
    await interaction.reply({
      content: `**CLIENT IOS**
- DELTA VNG
- SKIBX VNG`,
      ephemeral: true
    });
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
