const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const axios = require("axios");
const ytdl = require("ytdl-core");

// ===== DISCORD BOT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== BOT READY =====
client.once("ready", () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

// ===== MESSAGE EVENT =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // ===== TEST =====
  if (message.content === "!ping") {
    message.reply("🏓 Pong!");
  }

  // ===== TIKTOK DOWNLOAD =====
  if (message.content.startsWith("!tt ")) {
    const url = message.content.split(" ")[1];

    try {
      const api = `https://www.tikwm.com/api/?url=${url}`;
      const res = await axios.get(api);

      const video = res.data.data.play;

      message.reply({
        content: "📥 Video TikTok:",
        files: [video]
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ Không tải được video TikTok!");
    }
  }

  // ===== YOUTUBE DOWNLOAD =====
  if (message.content.startsWith("!yt ")) {
    const url = message.content.split(" ")[1];

    if (!ytdl.validateURL(url)) {
      return message.reply("❌ Link YouTube không hợp lệ!");
    }

    try {
      const stream = ytdl(url, { filter: "audioonly" });

      message.reply({
        content: "🎵 Audio YouTube:",
        files: [{
          attachment: stream,
          name: "audio.mp3"
        }]
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ Lỗi tải YouTube!");
    }
  }
});

// ===== WEB SERVER (GIỮ BOT ONLINE) =====
const app = express();
app.get("/", (req, res) => res.send("Bot đang chạy!"));

app.listen(10000, () => {
  console.log("🌐 Web server chạy cổng 10000");
});

// ===== LOGIN (QUAN TRỌNG NHẤT) =====
console.log("👉 Đang login...");

client.login(process.env.TOKEN)
  .then(() => console.log("✅ Login thành công!"))
  .catch(err => console.error("❌ Lỗi login:", err));
