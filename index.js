const express = require('express');
const axios = require('axios');
const {
  Client,
  GatewayIntentBits
} = require('discord.js');

// ===== ANTI CRASH =====
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

// ===== WEB SERVER =====
const app = express();
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(3000, () => console.log('Web server chạy rồi'));

// ===== DISCORD BOT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== ANTI SPAM =====
const cooldown = new Map();

function isCooldown(userId) {
  const now = Date.now();
  const last = cooldown.get(userId) || 0;

  if (now - last < 2000) return true;
  cooldown.set(userId, now);
  return false;
}

// ===== DOWNLOAD VIDEO =====
async function downloadVideo(url) {
  try {
    const res = await axios.get(
      `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`,
      { timeout: 5000 }
    );
    return res.data.video || null;
  } catch {
    return null;
  }
}

// ===== READY =====
client.on('ready', () => {
  console.log(`Bot online: ${client.user.tag}`);
});

// ===== MESSAGE =====
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;

    const msg = message.content.toLowerCase().trim();
    console.log("MSG:", msg);

    // ===== LỆNH KHÔNG BỊ COOLDOWN =====
    if (msg === 'ping') return message.reply('pong 🏓');

    if (msg.includes("alo vũ")) {
      return message.reply("Không anh ơi");
    }

    if (msg.includes("chán học")) {
      return message.reply(`Alo Vũ à Vũ...
Không anh ơi 😔

Chán học à?

Thà để giọt mồ hôi rơi trên trang sách còn hơn là giọt nước mắt rơi trên đề thi.

"Học, học nữa, học mãi" - V.I. Lenin

💪 Nỗ lực hôm nay = thành công ngày mai!
📚 Đi học tiếp đi bro 😎`);
    }

    // ===== ANTI SPAM =====
    if (isCooldown(message.author.id)) return;

    // ===== AUTO DOWNLOAD VIDEO =====
    if (
      msg.includes("tiktok.com") ||
      msg.includes("youtube.com") ||
      msg.includes("youtu.be")
    ) {
      try {
        const video = await downloadVideo(message.content);

        if (!video) {
          return message.reply("❌ Không tải được video!");
        }

        return message.reply(`🎬 Video:\n${video}`);
      } catch (err) {
        console.error(err);
        return message.reply("❌ Lỗi tải video!");
      }
    }

  } catch (err) {
    console.error("Lỗi message:", err);
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN)
  .then(() => console.log("Đã login Discord"))
  .catch(err => console.error("Lỗi token:", err));
