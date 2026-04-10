const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

// ===== DEBUG TOKEN =====
console.log("TOKEN:", process.env.TOKEN ? "OK" : "THIẾU");

// ===== WEB SERVER =====
const app = express();
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(3000, () => console.log('Web OK'));

// ===== DISCORD BOT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`Bot online: ${client.user.tag}`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  // ===== PING =====
  if (msg === 'ping') {
    return message.reply('pong 🏓');
  }

  // ===== MEME ALO VŨ =====
  if (msg.includes('alo vũ')) {
    return message.reply('Không anh ơi 😔');
  }

  // ===== CHÁN HỌC =====
  if (msg.includes('chán học')) {
    return message.reply(`Alo Vũ à Vũ...
Không anh ơi 😔

Chán học à?

Thà để giọt mồ hôi rơi trên trang sách còn hơn là giọt nước mắt rơi trên đề thi.

"Học, học nữa, học mãi" - V.I. Lenin
"Đừng lựa chọn an nhàn khi còn trẻ"
"Học tập như thế đi thuyền ngược dòng nước"

🔥 Cố lên bro!`);
  }

  // ===== DELTA VNG =====
  if (msg.includes('delta vng')) {
    return message.reply('Delta VNG https://www.mediafire.com/file/ipjryzyulpcul1v/Delta_Vng-2.714.1096_Up.apk/file');
  }

  // ===== CODEX VNG =====
  if (msg.includes('codex vng')) {
    return message.reply('CODEX VNG V2.711 BY NAKNOHACK https://www.mediafire.com/file/i43otfr7w6ukcod/Codex.apk/file');
  }

  // ===== ARCEUS VNG =====
  if (msg.includes('arceus neo vng')) {
    return message.reply('ARCEUS NEO VNG https://www.mediafire.com/file/i5g2c4tasweprps/Arceus.apk/file');
  }

  // ===== DELTA IOS =====
  if (msg.includes('delta vng ios')) {
    return message.reply('https://www.mediafire.com/file/afmig367b9v2hr5/DeltaVN+V57+HuyMythic.ipa/file');
  }

});

// ===== LOGIN =====
client.login(process.env.TOKEN);
