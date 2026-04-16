const { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder 
} = require("discord.js");

require("dotenv").config();
const axios = require("axios");

// ====== CONFIG ======
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// ====== DEBUG TOKEN ======
console.log(">>>TOKEN START<<<");
console.log(TOKEN);
console.log(">>>TOKEN END<<<");
console.log("LENGTH:", TOKEN?.length);

// ====== CREATE CLIENT ======
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ====== SLASH COMMAND ======
const commands = [
  new SlashCommandBuilder()
    .setName("taivideo")
    .setDescription("Tải Video Youtube hoặc Tiktok")
    .addStringOption(option =>
      option.setName("link")
        .setDescription("Nhập link Youtube hoặc Tiktok")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Random meme")
].map(cmd => cmd.toJSON());

// ====== REGISTER COMMAND ======
if (CLIENT_ID) {
  const rest = new REST({ version: "10" }).setToken(TOKEN);

  (async () => {
    try {
      console.log("🔄 Đang đăng ký slash command...");
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
      console.log("✅ Đã đăng ký lệnh!");
    } catch (err) {
      console.error("❌ Lỗi đăng ký lệnh:", err);
    }
  })();
} else {
  console.log("⚠️ Chưa có CLIENT_ID → bỏ qua slash command");
}

// ====== BOT READY ======
client.once("ready", () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
});

// ====== HANDLE COMMAND ======
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // ====== /taivideo ======
  if (interaction.commandName === "taivideo") {
    const link = interaction.options.getString("link");

    await interaction.reply("⏳ Đang tải video...");

    try {
      // API demo (bạn có thể đổi API khác nếu muốn)
      const api = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(link)}`;
      const res = await axios.get(api);

      const videoUrl = res.data.video?.noWatermark || res.data.video;

      if (!videoUrl) {
        return interaction.editReply("❌ Không lấy được video!");
      }

      await interaction.editReply({
        content: "✅ Video của bạn:",
        files: [videoUrl]
      });

    } catch (err) {
      console.error(err);
      await interaction.editReply("❌ Lỗi tải video!");
    }
  }

  // ====== /meme ======
  if (interaction.commandName === "meme") {
    try {
      const res = await axios.get("https://meme-api.com/gimme");
      const meme = res.data.url;

      await interaction.reply({
        content: "😂 Meme đây:",
        files: [meme]
      });

    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Không lấy được meme!");
    }
  }
});

// ====== LOGIN ======
client.login(TOKEN).catch(err => {
  console.error("❌ LOGIN LỖI:", err);
});
