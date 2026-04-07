const express = require('express');
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

// ===== WEB SERVER (fix lỗi Render) =====
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

  const msg = message.content.toLowerCase();

  // Ping
  if (msg === 'ping') {
    return message.reply('pong 🏓');
  }

  // Meme alo Vũ
  if (msg.includes("alo vũ")) {
    return message.reply("Không anh ơi");
  }

  // Động lực
  if (msg.includes("chán học")) {
    return message.reply(`Alo Vũ à Vũ...
Không anh ơi 😔

Chán học à?

Thà để giọt mồ hôi rơi trên trang sách còn hơn là giọt nước mắt rơi trên đề thi.

"Học, học nữa, học mãi" - V.I. Lenin

"Đừng lựa chọn an nhàn khi còn trẻ".

"Học tập như thế đi thuyền ngược dòng nước. Bạn phải tiến lên phía trước nếu không muốn bị tụt lại phía sau".

"Lựa chọn hôm nay vẽ nên kết quả của ngày mai".

💪 Hãy luôn nhớ:
Nỗ lực hôm nay = thành công ngày mai!

📚 Đi học tiếp đi bro 😎`);
  }

  // Link Delta VNG
  if (msg.includes("delta vng")) {
    return message.reply(`Delta VNG:
https://www.mediafire.com/file/ipjryzyulpcul1v/Delta_Vng-2.714.1096_Up.apk/file`);
  }

  // Menu chọn client
  if (msg === 'all client') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('select_os')
      .setPlaceholder('👉 Chọn hệ điều hành')
      .addOptions([
        { label: 'Android', value: 'android' },
        { label: 'iOS', value: 'ios' }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await message.reply({
      content: '📦 Chọn hệ điều hành bạn muốn:',
      components: [row]
    });
  }
});

// Xử lý menu
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  const choice = interaction.values[0];

  if (choice === 'android') {
    await interaction.reply({
      content: `**CLIENT ANDROID**
- DELTA VNG
- CODEX VNG
- Arceus Neo VNG`,
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
